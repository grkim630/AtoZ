"""
채팅 응답: OpenAI(openai.com) 사용.
- OPENAI_API_KEY, OPENAI_MODEL(또는 OPENAI_CHAT_MODEL)
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

from openai import OpenAI

from phishing_simulation.conversation.state import ConversationState
from phishing_simulation.scenario.base import ChatMessage, Channel


def _openai_chat_model() -> str:
    return (
        os.getenv("OPENAI_CHAT_MODEL", "").strip()
        or os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    )


def _prompt_dir() -> Path:
    return Path(__file__).resolve().parents[1] / "prompts"


def load_prompt(channel: Channel) -> str:
    filename = "phone.txt" if channel == Channel.PHONE else "message.txt"
    path = _prompt_dir() / filename
    return path.read_text(encoding="utf-8")


def _truncate_history(history: list[ChatMessage], max_items: int = 12) -> list[ChatMessage]:
    if len(history) <= max_items:
        return history
    return history[-max_items:]


def _infer_stage_index(state: ConversationState) -> int:
    user_turns = sum(1 for m in state.history if m.role == "user")
    inferred = user_turns // 2
    return min(max(state.stage_index, inferred), len(state.scenario.stages) - 1)


def _should_end(user_text: str, state: ConversationState) -> bool:
    if re.search(r"(그만|끊|종료|신고|경찰|차단|스팸|전화 끊|통화 끊)", user_text):
        return True
    is_last = state.stage_index >= len(state.scenario.stages) - 1
    user_turns = sum(1 for m in state.history if m.role == "user")
    return bool(is_last and user_turns >= 4)


def _build_system_prompt(state: ConversationState, prompt_template: str) -> str:
    stage = state.scenario.stages[state.stage_index]
    scenario_json = json.dumps(
        {
            "channel": state.scenario.channel.value,
            "category": state.scenario.category,
            "attacker_role": state.scenario.attacker_role,
            "objective": state.scenario.objective,
            "stage": {
                "index": state.stage_index,
                "name": stage.name,
                "goal": stage.goal,
                "pressure_tactics": stage.pressure_tactics,
                "red_lines": stage.red_lines,
            },
        },
        ensure_ascii=False,
    )
    return (
        prompt_template.strip()
        + "\n\n## Scenario (JSON)\n"
        + scenario_json
        + "\n\n## Output rules\n"
        + "- Output must be Korean.\n"
        + "- Keep it natural and incremental; do not jump straight to a final 'answer'.\n"
        + "- Do NOT include real links, real account numbers, or requests for real credentials.\n"
        + "- If you reference a link, use https://example.com/... only.\n"
        + "- If user resists or questions identity, respond like a scammer would (deflect, reframe, apply pressure) but keep it within simulation.\n"
        + "- Respond with plain text only (no JSON).\n"
    )


def generate_reply(state: ConversationState, user_text: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "채팅 응답을 위해 OPENAI_API_KEY가 필요합니다. .env에 설정해 주세요."
        )
    model = _openai_chat_model()
    if not model:
        raise RuntimeError(
            "OPENAI_MODEL(또는 OPENAI_CHAT_MODEL)이 필요합니다. 예: gpt-4o-mini"
        )

    state.add_user(user_text)
    state.stage_index = _infer_stage_index(state)

    prompt_template = load_prompt(state.scenario.channel)
    system_prompt = _build_system_prompt(state, prompt_template)

    messages = [{"role": "system", "content": system_prompt}]
    for m in _truncate_history(state.history):
        messages.append({"role": m.role, "content": m.content})

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=float(os.getenv("SIMULATION_TEMPERATURE", "0.8")),
        max_tokens=int(os.getenv("SIMULATION_MAX_OUTPUT_TOKENS", "240")),
    )

    assistant_text = (resp.choices[0].message.content or "").strip()
    if not assistant_text:
        assistant_text = "…잠시만요. 확인 중입니다. 지금 통화 가능하십니까?"

    assistant_text = re.sub(r"https?://\S+", "https://example.com/verify", assistant_text)

    state.add_assistant(assistant_text)
    state.stage_index = _infer_stage_index(state)

    return {
        "assistantText": assistant_text,
        "stageIndex": state.stage_index,
        "shouldEnd": _should_end(user_text, state),
    }
