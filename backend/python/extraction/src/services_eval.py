from __future__ import annotations

import httpx

from src.config import settings


def evaluate_clean_text(clean_text: str) -> dict | None:
    """
    evaluation의 추론 API로 clean_text를 전달하고 결과(dict)를 반환.
    - settings.EVALUATION_API_URL이 없으면 None 반환
    - 실패 시 예외를 밖으로 던지지 않고 None 반환(파이프라인 방어)
    """
    base = (settings.EVALUATION_API_URL or "").strip()
    if not base:
        return None

    url = base.rstrip("/") + "/evaluate"
    try:
        with httpx.Client(timeout=settings.EVALUATION_API_TIMEOUT_SECONDS) as client:
            r = client.post(url, json={"text": clean_text, "already_clean": True})
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, dict) else None
    except Exception:
        return None

