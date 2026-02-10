from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from preprocess.text_clean import preprocess_text
from inference.predictor import predict_risk


app = FastAPI(title="Evaluation API", version="0.1.0")


class EvaluateRequest(BaseModel):
    text: str
    already_clean: bool = False


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/evaluate")
def evaluate(payload: EvaluateRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text가 비어있습니다.")

    clean = text if payload.already_clean else preprocess_text(text)
    out = predict_risk(clean)

    # out: {"label": "...", "risk_score": 0.xxx}
    if not isinstance(out, dict) or "label" not in out or "risk_score" not in out:
        raise HTTPException(status_code=500, detail="추론 결과 포맷이 올바르지 않습니다.")

    return {"clean_text": clean, **out}

