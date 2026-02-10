# Backend Server (NestJS)

이 폴더는 프로젝트의 **백엔드 API 서버(NestJS + Prisma)** 입니다.

---

## 기술 스택

- NestJS (TypeScript)
- Prisma ORM
- DB: 기본은 SQLite (`DATABASE_URL="file:./prisma/dev.db"`)
- 업로드 저장: `uploads/` (`raw/`, `tts/`)
- Python 연동(분석 파이프라인): `../python/extraction` (Node에서 venv python을 직접 실행해 `src.main.analyze_pipeline()`을 import하여 사용)
- Python 연동(평가/분류): `../python/evaluation` (Node에서 venv python을 직접 실행해 KoBERT 추론)

---

## 폴더 구조

```
backend/server/
├─ src/                # NestJS 소스 (controllers/services/modules)
├─ prisma/             # schema.prisma, migrations, dev.db(로컬)
├─ uploads/            # 업로드/생성 파일 저장 (git에 올리면 안 됨)
├─ dist/               # 빌드 산출물 (npm run build 시 생성)
├─ package.json
└─ .env(.example)
```

---

## 시작하기 (Windows / PowerShell)

```powershell
cd C:\phishing-experience\phishing-experience\backend\server
npm install
npx prisma generate
npm run start:dev
```

서버가 켜지면 아래로 확인할 수 있습니다.

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -TimeoutSec 5
```

---

## 환경 변수

`.env.example`를 참고해서 `backend/server/.env`를 준비합니다.

- `DATABASE_URL`: 기본은 SQLite(`file:./prisma/dev.db`)
- `JWT_SECRET`, `JWT_EXPIRES_IN`: 인증(JWT)
- `UPLOAD_DIR`, `UPLOAD_MAX_BYTES`: 업로드 저장소/용량 제한
- `CORS_ORIGIN`: 허용 Origin 목록(콤마 구분)
- `EXTRACTED_TEXT_PYTHON` / `PYTHON_EXTRACTOR_PATH` (선택): `backend/python/extraction/.venv`의 **python.exe 절대경로**
- `EVALUATION_PYTHON` (선택): `backend/python/evaluation/.venv`의 **python.exe 절대경로**
- `OPENAI_API_KEY`: 서버에서 LLM 호출에 사용(시나리오/평가 등)
- `OPENAI_BASE_URL` (선택): 서버(Experience) 호출용 베이스 URL  
  - 기본 OpenAI 사용 시 설정하지 않는 것을 권장  
  - extraction Python SDK는 `https://api.openai.com/v1`을 사용하므로, `.../v1/responses` 형태 값을 강제하지 마세요.

---

## DB / Prisma

- Prisma Client 생성:

```powershell
npm run db:generate
```

- 개발 마이그레이션:

```powershell
npm run db:migrate:dev
```

- DB 보기(Studio):

```powershell
npm run db:studio
```

---

## 주요 API 모듈(요약)

- `auth`: `/auth/*`
- `users`: `/users/*`
- `uploads`: `/uploads/*`
- `extracted-text`: `/extracted-text/*` (Python extraction 실행 포함)
- `summaries`: `/summaries/*`
- `scripts`: `/scripts/*`
- `tts`: `/tts/*`
- `experience`: `/experience/*`
- `sessions`: `/sessions/*`
- `logs`: `/logs/*`
- `llm-feedback`: `/llm-feedback/*`
- `analysis`: `/analysis/*` (유형 분류/스크립트 검증/통합 파이프라인)

자세한 엔드포인트 목록은 루트 `README.md`의 “API 명세” 섹션을 참고하세요.

---

## Analysis API (신규)

기존 `uploads` / `extracted-text` / `summaries` / `scripts` 흐름을 재사용하며, 아래 3개 API를 추가했습니다.

- `POST /analysis/classify`
  - 입력: `{ uploadedFileId }`
  - 출력: `predictedType`, `confidence`, `allScores`, `debug`
- `POST /analysis/validate-script`
  - 입력: `{ script, expectedType }`
  - 출력: `score`, `isValid`, `reason`, `debug`
- `POST /analysis/pipeline`
  - 입력: `{ uploadedFileId, scriptType?, expectedType?, script? }`
  - 출력: 단계별 중간 결과(`stageResults`) + 실패 단계(`failedStage`)

---

## 소스코드 가이드 (Code Navigation)

처음 코드를 읽을 때 아래 순서로 보면 전체 흐름을 빠르게 이해할 수 있습니다.

### 1) 서버 엔트리포인트 / 공통 설정

- `src/main.ts`
  - CORS 설정(`CORS_ORIGIN`)
  - 전역 ValidationPipe(whitelist/transform)
  - 전역 예외 필터(`HttpExceptionLoggingFilter`)
- `src/app.module.ts`
  - 전체 모듈을 조합하는 루트 모듈
  - 요청 로깅 미들웨어 적용(`RequestLoggingMiddleware`)

### 2) 인증/권한(Guard) 흐름

- `src/auth/jwt.strategy.ts`, `src/auth/jwt-auth.guard.ts`
  - 보호된 라우트에서 `Authorization: Bearer <token>`을 검증
- `src/common/decorators/current-user.decorator.ts`
  - 컨트롤러에서 현재 사용자 정보 주입
- `src/common/decorators/roles.decorator.ts`, `src/common/guards/roles.guard.ts`
  - ADMIN 전용 엔드포인트(예: `/uploads/all`, `/logs/all`) 보호

### 3) DB 접근 계층(Prisma)

- `src/prisma/prisma.service.ts`
  - 앱 시작 시 DB 연결(init) 및 PrismaClient 제공
- `prisma/schema.prisma`, `prisma/migrations/`
  - 스키마/마이그레이션 정의

### 4) 파일 업로드 저장 흐름

- `src/uploads/uploads.controller.ts`
  - `multipart/form-data`로 업로드 수신(`file` 필드)
- `src/uploads/uploads.service.ts`
  - 파일을 `uploads/raw`에 저장하고 DB(`UploadedFile`)에 메타데이터 기록

### 5) “추출/분석(extracted-text)” 핵심 흐름 (Node ↔ Python)

- `src/extracted-text/extracted-text.controller.ts`
  - 업로드된 파일 id 기준으로 추출/분석 트리거: `POST /extracted-text/:uploadedFileId`
- `src/extracted-text/extracted-text.service.ts`
  - venv Python을 실행해 `backend/python/extraction`을 워킹 디렉토리로 잡고,
    `src.main.analyze_pipeline()`을 import해서 분석 결과(JSON)를 받아 DB에 저장

> 이 구조 덕분에 백엔드는 “파이썬 API 서버”를 따로 띄우지 않아도 동작합니다.

### 6) 요약/시나리오/TTS 생성 파이프라인

보통 다음 순서로 이어집니다.

`uploads` → `extracted-text` → `summaries` → `scripts` → `tts`

- `src/summaries/*`: 추출 텍스트 기반 요약/키워드 저장
- `src/scripts/*`: 시나리오(JSON) 생성/저장 (CHAT/CALL)
- `src/tts/*`: CALL 시나리오에 대해 TTS 파일 생성/저장

### 7) 체험/세션/평가(Experience / Sessions)

- `src/experience/experience.controller.ts`
  - 키워드 기반 시나리오 조회(`GET /experience/scenario`)
  - 대화형 답장 생성(`POST /experience/reply`)
- `src/sessions/sessions.controller.ts`
  - 세션 생성/메시지/행동 이벤트/설문/평가/결과 조회를 담당

### 8) 로깅/피드백 데이터

- `src/logs/*`: 사용자 체험 로그 저장/조회
- `src/llm-feedback/*`: LLM 평가/피드백 데이터셋 적재

---

## Python 분석 파이프라인 연동(중요)

이 서버는 `backend/python/extraction`을 **HTTP로 호출하지 않고**, venv Python을 실행해서 다음을 직접 import하여 분석을 수행합니다.

- `backend/python/extraction/src/main.py`의 `analyze_pipeline()`

따라서 다음이 준비되어야 합니다.

- `backend/python/extraction/.venv` 생성 및 `requirements.txt` 설치
- (선택) `EXTRACTED_TEXT_PYTHON`에 venv python 절대경로 지정  
  - 미지정 시에도 기본 경로(`backend/python/extraction/.venv/...`)를 탐색합니다.

---

## 스크립트

- 개발 실행: `npm run start:dev`
- 빌드: `npm run build`
- 프로덕션 실행: `npm run start:prod` (사전 `npm run build` 필요)
- 테스트: `npm run test`, `npm run test:e2e`

