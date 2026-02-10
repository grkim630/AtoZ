from __future__ import annotations

import random

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from phishing_simulation.conversation.engine import generate_reply
from phishing_simulation.conversation.state import STORE
from phishing_simulation.scenario.base import MessageCategory, Scenario
from phishing_simulation.scenario.message import generate_message_scenario


router = APIRouter(prefix="/message", tags=["message"])


class CreateMessageScenarioRequest(BaseModel):
    category: MessageCategory
    difficulty: int = Field(default=2, ge=1, le=3)
    seed: int | None = None


class CreateMessageScenarioResponse(BaseModel):
    scenario: Scenario


class CreateMessageSessionRequest(CreateMessageScenarioRequest):
    recommended_delay_seconds_min: int = Field(default=2, ge=0, le=30)
    recommended_delay_seconds_max: int = Field(default=4, ge=0, le=30)


class CreateMessageSessionResponse(BaseModel):
    sessionId: str
    scenario: Scenario
    firstAssistantMessage: str
    recommendedDelaySeconds: int
    stageIndex: int


class ReplyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class ReplyResponse(BaseModel):
    assistantText: str
    stageIndex: int
    shouldEnd: bool


@router.post("/scenarios", response_model=CreateMessageScenarioResponse)
def create_message_scenario(req: CreateMessageScenarioRequest):
    scenario = generate_message_scenario(req.category, difficulty=req.difficulty, seed=req.seed)
    return CreateMessageScenarioResponse(scenario=scenario)


@router.post("/sessions", response_model=CreateMessageSessionResponse)
def create_message_session(req: CreateMessageSessionRequest):
    scenario = generate_message_scenario(req.category, difficulty=req.difficulty, seed=req.seed)

    delay_min = min(req.recommended_delay_seconds_min, req.recommended_delay_seconds_max)
    delay_max = max(req.recommended_delay_seconds_min, req.recommended_delay_seconds_max)
    recommended_delay = random.randint(delay_min, delay_max) if delay_max > 0 else 0

    # 문자도 "AI가 먼저" 보내는 구조 → opening_line을 세션 히스토리에 포함
    state = STORE.create(scenario, opening_assistant_line=scenario.opening_line)
    return CreateMessageSessionResponse(
        sessionId=state.session_id,
        scenario=scenario,
        firstAssistantMessage=scenario.opening_line,
        recommendedDelaySeconds=recommended_delay,
        stageIndex=state.stage_index,
    )


@router.get("/sessions/{session_id}")
def get_message_session(session_id: str):
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")
    return st.model_dump()


@router.delete("/sessions/{session_id}")
def delete_message_session(session_id: str):
    STORE.delete(session_id)
    return {"ok": True}


@router.post("/sessions/{session_id}/reply", response_model=ReplyResponse)
def message_reply(session_id: str, req: ReplyRequest):
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")

    try:
        out = generate_reply(st, req.text)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    STORE.save(st)
    return ReplyResponse(**out)

