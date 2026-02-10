# phishing_simulation (FastAPI)

전화 피싱 / 문자(스미싱) **체험형 시나리오 기반 대화**를 제공하는 독립 FastAPI 서비스입니다.

- 기존 `backend/server`(NestJS) 및 기존 Python 파이프라인과 **완전 분리**
- 공통 구성: `시나리오 생성 → 세션(상태) 생성/유지 → 사용자 입력 → AI 응답`

## 실행

PowerShell 예시:

```powershell
cd c:\phishing-experience\phishing-experience\backend\python\phishing_simulation
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8010 --reload
```

## 프론트 연동

프론트(`frontend/.env`)에서 아래 값을 이 서버 주소로 맞춥니다.

```env
EXPO_PUBLIC_SIMULATION_API_BASE_URL=http://<PC_LAN_IP>:8010
```

## 환경 구성 (역할 분리)

- **Azure Speech** (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION): **STT**(음성→텍스트), **TTS**(텍스트→음성)
- **OpenAI** (OPENAI_API_KEY, OPENAI_MODEL): **채팅 응답** 생성(시나리오 대화)

`.env.example` 참고 후 `.env`에 위 변수를 설정하세요.

## 엔드포인트(요약)

- `GET /health`
- `POST /phone/sessions` : 전화 시나리오+세션 생성(첫 멘트 포함)
- `POST /phone/sessions/{sessionId}/stt` : 음성 업로드 → STT(Azure Speech 또는 OpenAI Whisper) → 텍스트
- `POST /phone/sessions/{sessionId}/tts` : 텍스트 → Azure Speech TTS → 음성 바이트
- `POST /phone/sessions/{sessionId}/reply` : 텍스트 입력 → OpenAI로 다음 응답 생성
- `POST /message/sessions` : 문자 시나리오+세션 생성(첫 메시지 포함)
- `POST /message/sessions/{sessionId}/reply` : 텍스트 입력 → 다음 메시지 생성

## API 테스트

서버 실행 후 프로젝트 디렉터리에서:

```bash
.venv\Scripts\python test_api.py
```

- `POST .../reply` 는 **OPENAI_API_KEY**, **OPENAI_MODEL**(또는 OPENAI_CHAT_MODEL) 설정 시 성공합니다.

## 주의

이 서비스는 **교육/체험 목적의 시뮬레이션**을 전제로 하며, 프롬프트에서 실제 악용 가능성이 있는 정보(실제 링크/계좌/개인정보 수집 등)를 금지하도록 설계되어 있습니다.

또한 동일 모노레포의 `evaluation` FastAPI를 동시에 실행하는 경우, `phishing_simulation` 기본 포트가 `8010`이므로 `evaluation`은 다른 포트(예: `8020`)로 실행하는 것을 권장합니다.
