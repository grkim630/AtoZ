# backend/python (Python 구성요소)

이 디렉토리는 프로젝트의 Python 기반 기능들을 모아둔 곳입니다.

- `extraction/`: 업로드 파일(음성/이미지/텍스트)에서 텍스트를 추출·정리(STT/OCR/LLM)하고 risk score 등을 산출
- `phishing_simulation/`: 전화/문자 체험(시나리오 기반 대화)용 독립 FastAPI 서비스
- `evaluation/`: (선택) KoBERT 기반 2클래스(phishing/normal) 평가 API

---

## 무엇을 “서버로 띄우는가?”

- `extraction/`
  - 단독 테스트 목적이면 FastAPI로 실행 가능(예: `:8000`)
  - 실제 앱 플로우에서는 `backend/server`(NestJS)가 venv Python을 실행해서 `src.main.analyze_pipeline()`을 **직접 import 호출**하는 방식이 기본입니다.
- `phishing_simulation/`
  - 독립 FastAPI 서버로 실행합니다(기본 `:8010`)
  - 프론트에서 `EXPO_PUBLIC_SIMULATION_API_BASE_URL`로 접근합니다.
- `evaluation/`
  - 독립 FastAPI 서버로 실행합니다.
  - `phishing_simulation` 기본 포트가 `8010`이므로, 동시에 띄우는 경우 `evaluation`은 `8020` 등 다른 포트를 권장합니다.

---

## 권장 포트(기본 예시)

- `extraction` FastAPI(단독 테스트용): `8000`
- `phishing_simulation` FastAPI: `8010`
- `evaluation` FastAPI: `8020` (권장)

---

## 빠른 링크

- Extraction: `backend/python/extraction/README.md`
- Simulation: `backend/python/phishing_simulation/README.md`
- Evaluation: `backend/python/evaluation/README.md`

