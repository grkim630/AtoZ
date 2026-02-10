# Extraction (STT/OCR/LLM 기반 피싱 텍스트 추출·정리)

음성/이미지/텍스트 입력을 받아 **민감정보 마스킹 → 시그널 탐지(룰/LLM) → 요약/키워드 → 위험도 점수화**를 수행합니다.

- 입력 타입: `audio`(STT), `image`(OCR), `text`
- 출력: `CleanResult` (cleanText/summary/keywords/signals/riskScore + 선택적으로 evaluation 결과)

---

## 폴더/파일 구성

- `src/main.py`
  - FastAPI 앱 + 공통 파이프라인 함수 `analyze_pipeline()`
- `src/services_stt.py`
  - OpenAI STT(실패/키 없음이면 데모 텍스트 반환)
- `src/services_ocr.py`
  - OpenAI Vision OCR
- `src/services_llm.py`
  - LLM 요약/키워드/시그널(JSON)
- `src/utils_mask.py`
  - 민감정보 마스킹
- `src/utils_risk.py`
  - 룰 기반 시그널 탐지 + riskScore 계산
- `src/services_eval.py` (선택)
  - `EVALUATION_API_URL` 설정 시 `evaluation` API로 평가 결과 병합
- `requirements.txt`
  - 실행에 필요한 파이썬 패키지 목록

---

## 설치 (Windows / PowerShell)

```powershell
cd C:\phishing-experience\phishing-experience\backend\python\extraction
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 환경 변수

이 폴더의 `.env`를 사용합니다. (`src/config.py`에서 `env_file=".env"` 로드)

```env
OPENAI_API_KEY=...
# (선택) evaluation API 서버 주소
EVALUATION_API_URL=http://127.0.0.1:8010
EVALUATION_API_TIMEOUT_SECONDS=5
```

---

## 실행 방법

### 1) API 서버 실행(FastAPI) — 단독 실행/테스트용

```powershell
.\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 8000
```

### 2) NestJS에서의 사용 방식(중요)

이 프로젝트의 NestJS 백엔드는 **이 폴더를 별도의 HTTP 서버로 호출하지 않고**, venv 파이썬을 이용해 `src.main.analyze_pipeline()`을 **직접 import하여 실행**합니다. (Node에서 `python -c ...` 방식)

#### NestJS 실행 조건
- NestJS는 `backend/python/extraction/.venv/Scripts/python.exe`를 절대 경로로 사용해야 합니다.
- `EXTRACTED_TEXT_PYTHON`(또는 `PYTHON_EXTRACTOR_PATH`)을 사용한다면 반드시 위 venv 경로의 **절대 경로**로 지정하세요.
- 시스템 Python은 차단되며, OpenAI SDK `responses` API 지원 여부를 실행 전에 검증합니다.

---

## API 사용 예시 (FastAPI 실행 시)

> 아래는 **FastAPI를 띄웠을 때** 테스트용으로 사용할 수 있습니다.

- Health:

```powershell
curl http://127.0.0.1:8000/health
```

- Text:

```powershell
curl -X POST http://127.0.0.1:8000/ingest/text -H "Content-Type: application/json" -d "{\"text\":\"택배 배송이 지연되었습니다. 링크를 확인하세요\"}"
```

- Audio / Image:
  - `/ingest/audio`, `/ingest/image`는 `multipart/form-data`로 `file` 업로드를 받습니다.

---

## `evaluation` 연동 방법(선택)

`EVALUATION_API_URL`이 설정되어 있으면, clean text를 `evaluation`의 `/evaluate`로 보내서 `evalLabel`, `evalRiskScore`를 결과에 합쳐줍니다.

1) `evaluation` API 서버 실행:

```powershell
cd C:\phishing-experience\phishing-experience\backend\python\evaluation
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8010
```

2) `extraction/.env`에 추가:

```env
EVALUATION_API_URL=http://127.0.0.1:8010
```

