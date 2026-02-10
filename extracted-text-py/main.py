import json
from fastapi import FastAPI, UploadFile, File, HTTPException

from app.schemas import CleanResult, IngestTextRequest
from app.utils_mask import mask_sensitive
from app.utils_risk import detect_signals, score_risk
from app.services_llm import llm_extract
from app.services_stt import stt_transcribe
from app.services_eval import evaluate_clean_text

from app.config import settings
from app.services_ocr import ocr_extract_text  # 키 없으면 아래에서 데모 처리

app = FastAPI(title="Phish Cleaner API", version="0.1.0")

# 데모용 OCR 텍스트 (키 없거나 실패할 때)
DEMO_OCR_TEXT = (
    "[데모 OCR] 택배 배송이 지연되었습니다. 아래 링크에서 배송 정보를 확인하세요: https://bit.ly/demo"
)

# -----------------------------
# 공통 분석 파이프라인
# -----------------------------
def analyze_pipeline(source_type: str, raw_text: str) -> CleanResult:
    clean_text = mask_sensitive(raw_text)

    # 룰 기반 시그널
    signals_rule = detect_signals(clean_text)

    # LLM 분석 (키 없으면 services_llm에서 실패할 수 있으니 try/except로 방어)
    try:
        llm_out = llm_extract(clean_text)

        # llm_extract가 JSON 문자열을 반환하는 경우
        if isinstance(llm_out, str):
            llm_data = json.loads(llm_out)
        # llm_extract가 dict를 반환하는 경우
        elif isinstance(llm_out, dict):
            llm_data = llm_out
        else:
            llm_data = {"summary": "", "keywords": [], "signals": []}

    except Exception:
        llm_data = {"summary": "", "keywords": [], "signals": []}

    # 룰 + LLM 시그널 병합
    signals = sorted(set(signals_rule) | set(llm_data.get("signals", [])))
    risk = score_risk(signals)

    # (선택) evaluation-py 모델 추론(실패해도 파이프라인은 계속)
    eval_out = evaluate_clean_text(clean_text)
    eval_label = None
    eval_risk = None
    if isinstance(eval_out, dict):
        # 예상 포맷: {"label": "...", "risk_score": 0.xxx, "clean_text": "..."} 등
        eval_label = eval_out.get("label")
        eval_risk = eval_out.get("risk_score")

    return CleanResult(
        sourceType=source_type,
        rawText=raw_text,
        cleanText=clean_text,
        summary=llm_data.get("summary") or "요약을 생성하지 못했습니다.",
        keywords=(llm_data.get("keywords") or [])[:7],
        signals=signals,
        riskScore=risk,
        evalLabel=eval_label,
        evalRiskScore=eval_risk,
    )

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
def health():
    return {"ok": True}

# -----------------------------
# Text Ingest
# -----------------------------
@app.post("/ingest/text", response_model=CleanResult)
def ingest_text(payload: IngestTextRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text가 비어있습니다.")
    return analyze_pipeline("text", text)

# -----------------------------
# Audio Ingest (STT)
# -----------------------------
@app.post("/ingest/audio", response_model=CleanResult)
async def ingest_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="파일이 비어있습니다.")

    try:
        raw_text = stt_transcribe(audio_bytes, file.filename or "audio.m4a")
    except Exception as e:
        # 데모 모드: STT 실패해도 최소 텍스트 반환하도록 방어
        raw_text = "[STT 실패 데모] 통화 내용 추출에 실패했습니다. " \
                   "지금 바로 링크를 클릭해 본인 확인하세요: https://bit.ly/demo"

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="STT 결과가 비어있습니다.")

    return analyze_pipeline("audio", raw_text)

@app.post("/ingest/image", response_model=CleanResult)
async def ingest_image(file: UploadFile = File(...)):
    img_bytes = await file.read()
    if not img_bytes:
        raise HTTPException(status_code=400, detail="파일이 비어있습니다.")

    try:
        raw_text = ocr_extract_text(img_bytes)  # ✅ OpenAI Vision OCR
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 실패: {repr(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="OCR 결과가 비어있습니다.")

    return analyze_pipeline("image", raw_text)


