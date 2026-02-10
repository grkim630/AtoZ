from __future__ import annotations

import random

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field

from phishing_simulation.conversation.engine import generate_reply
from phishing_simulation.conversation.state import STORE
from phishing_simulation.scenario.base import PhoneCategory, Scenario
from phishing_simulation.scenario.phone import generate_phone_scenario
from phishing_simulation.stt.whisper import transcribe_upload
from phishing_simulation.tts import synthesize_speech


router = APIRouter(prefix="/phone", tags=["phone"])


class CreatePhoneScenarioRequest(BaseModel):
    category: PhoneCategory
    difficulty: int = Field(default=2, ge=1, le=3)
    seed: int | None = None


class CreatePhoneScenarioResponse(BaseModel):
    scenario: Scenario


class CreatePhoneSessionRequest(CreatePhoneScenarioRequest):
    recommended_delay_seconds_min: int = Field(default=3, ge=0, le=30)
    recommended_delay_seconds_max: int = Field(default=5, ge=0, le=30)


class CreatePhoneSessionResponse(BaseModel):
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


class SttResponse(BaseModel):
    text: str


class TtsRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


@router.post("/scenarios", response_model=CreatePhoneScenarioResponse)
def create_phone_scenario(req: CreatePhoneScenarioRequest):
    scenario = generate_phone_scenario(req.category, difficulty=req.difficulty, seed=req.seed)
    return CreatePhoneScenarioResponse(scenario=scenario)


@router.post("/sessions", response_model=CreatePhoneSessionResponse)
def create_phone_session(req: CreatePhoneSessionRequest):
    scenario = generate_phone_scenario(req.category, difficulty=req.difficulty, seed=req.seed)

    # 전화: AI가 먼저 말하는 구조 → opening_line을 세션 히스토리에 미리 넣어둠
    delay_min = min(req.recommended_delay_seconds_min, req.recommended_delay_seconds_max)
    delay_max = max(req.recommended_delay_seconds_min, req.recommended_delay_seconds_max)
    recommended_delay = random.randint(delay_min, delay_max) if delay_max > 0 else 0

    state = STORE.create(scenario, opening_assistant_line=scenario.opening_line)
    return CreatePhoneSessionResponse(
        sessionId=state.session_id,
        scenario=scenario,
        firstAssistantMessage=scenario.opening_line,
        recommendedDelaySeconds=recommended_delay,
        stageIndex=state.stage_index,
    )


@router.get("/sessions/{session_id}")
def get_phone_session(session_id: str):
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")
    return st.model_dump()


@router.delete("/sessions/{session_id}")
def delete_phone_session(session_id: str):
    STORE.delete(session_id)
    return {"ok": True}


@router.post("/sessions/{session_id}/stt", response_model=SttResponse)
async def phone_stt(session_id: str, file: UploadFile = File(...)):
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")
    try:
        text = await transcribe_upload(file)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return SttResponse(text=text)


@router.post("/sessions/{session_id}/tts", response_class=Response)
def phone_tts(session_id: str, req: TtsRequest):
    """Azure Speech TTS: 텍스트 → 음성 바이트 (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION 사용)."""
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")
    try:
        audio_bytes, content_type = synthesize_speech(req.text)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(content=audio_bytes, media_type=content_type)


@router.post("/sessions/{session_id}/reply", response_model=ReplyResponse)
def phone_reply(session_id: str, req: ReplyRequest):
    st = STORE.get(session_id)
    if not st:
        raise HTTPException(status_code=404, detail="session not found (expired or invalid)")

    try:
        out = generate_reply(st, req.text)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    STORE.save(st)
    return ReplyResponse(**out)

