from pydantic import BaseModel, Field
from typing import Literal, List

# -----------------------------
# 기본 분석 결과 스키마
# -----------------------------
SourceType = Literal["audio", "image", "text"]

class CleanResult(BaseModel):
    sourceType: SourceType
    rawText: str
    cleanText: str
    summary: str
    keywords: List[str] = Field(default_factory=list)
    signals: List[str] = Field(default_factory=list)
    riskScore: int = 0

    # (선택) evaluation-py 모델 기반 평가 결과
    evalLabel: str | None = None          # "phishing" | "normal"
    evalRiskScore: float | None = None    # 0.0 ~ 1.0


class IngestTextRequest(BaseModel):
    text: str

