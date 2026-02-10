# 시시콜콜(see_see_call_call)

피싱 범죄 실사례(통화 녹음 파일, SNS 스크린캡처본)를 공유하고, 실사례를 바탕으로 모의 피싱 범죄 체험 앱을 제작하는 프로젝트입니다.  
피싱 범죄를 학습하고 모의 체험을 통해 예방 능력을 높이는 것을 목표로 합니다.

- 소속: 중앙대학교 예술공학과
- 프로젝트 범위: NestJS 백엔드 + Expo(React Native) 프론트엔드 + Python(STT/OCR/LLM) 분석 파이프라인

## 목차
1. 프로젝트 개요
2. 협업 규칙 & Git 전략
3. 개발 환경 & 실행 가이드
4. 시스템 아키텍처
5. 아키텍처 개요 설명
6. 데이터 흐름
7. 서비스 시나리오
8. API 명세 (REST)
9. 파일 의존성 요약
10. 네이밍 규칙
11. 환경 변수 명세
12. 실행 순서 (Runbook)

---

## 1. 프로젝트 개요 (Introduction Layer)
**프로젝트 이름**: 시시콜콜(see_see_call_call)  
**프로젝트 설명**: 피싱 범죄 실사례(통화 녹음 파일, SNS 스크린캡처본)를 공유하고, 실사례를 바탕으로 모의 피싱 범죄 체험 앱 제작  
**목적**: 피싱 범죄 학습 및 모의 체험을 통한 예방 방식 확장  
**소속**: 중앙대학교 예술공학과

**팀원 및 역할**
- 이화(팀장): 기획, 발표, UX/UI 디자이너
- 김강륜: 백엔드 개발 및 API 구축
- 김도연: 백엔드 개발 및 API 구축
- 배기현: 기획, 프론트엔드 개발
- 황하린: Azure SDK 기반 API 구축

---

## 2. 협업 규칙 & Git 전략 (Collaboration Layer)
> 이 프로젝트에 참여하려면 어떻게 일해야 하는가

- **브랜치 전략**: `main`(배포/데모용) + `dev`(통합) + `name`(개인 작업)
- **개인 브랜치 정책**: 개인 작업은 `<name>` 브랜치에서 진행
- **머지 정책**: `name` → `dev`로 PR 머지, `dev` → `main`은 팀장 승인 후 진행
- **직접 push 금지**: `main`에는 직접 push 금지
- **커밋 메시지 규칙**: `type: short message` (예: `feat: add upload endpoint`)
- **의존성 공유 규칙**: 
  - 백엔드: `backend/server/package-lock.json` 커밋 필수
  - 프론트: `frontend/package-lock.json` 커밋 필수
  - Python: `backend/python/extraction/requirements.txt`, `backend/python/evaluation/requirements.txt`로 관리

---

## 3. 개발 환경 & 실행 가이드 (Onboarding Layer)
> 새 팀원이 30분 안에 실행 가능한 수준을 목표로 합니다.

### 백엔드 (NestJS)
**PowerShell 기준**
```bash
# 프로젝트 루트로 이동
cd C:\phishing-experience\phishing-experience
npm install
# Prisma Client 생성
npm run db:generate
npm run start:dev
```

> (대안) 백엔드 폴더에서 직접 실행
```bash
cd C:\phishing-experience\phishing-experience\backend\server
npm install
npx prisma generate
npm run start:dev
```

### 분석 파이프라인 (Python)
`backend/python/extraction/.venv`의 Python만 허용됩니다. (시스템 Python 차단)
```bash
cd C:\phishing-experience\phishing-experience\backend\python\extraction
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

### 프론트엔드 (Expo)
```bash
cd C:\phishing-experience\phishing-experience\frontend
npm install
npm run start
```

> (대안) 루트에서 실행
```bash
cd C:\phishing-experience\phishing-experience
npm run frontend:start
```

### Windows 주의사항
- PowerShell에서 경로 구분자(`\`) 사용
- Expo 앱에서 로컬 API 접근 시 `EXPO_PUBLIC_API_BASE_URL`를 내부 IP로 설정

### 보안 주의사항
- `.env`는 절대 공유/커밋 금지
- `OPENAI_API_KEY` 등 민감 정보는 개인 환경에서만 관리

---

## 4. 시스템 아키텍처 (Architecture Layer)
### 폴더 구조 요약
```
see_see_call_call/
├─ backend/
│  ├─ server/                # NestJS 백엔드
│  │  ├─ src/                 # NestJS 소스
│  │  ├─ prisma/              # DB 스키마/마이그레이션
│  │  ├─ uploads/             # 업로드/생성 파일 저장
│  │  └─ dist/                # (빌드 시 생성) 빌드 결과물
│  └─ python/                # Python(STT/OCR/LLM, 평가 모델 등)
│     ├─ extraction/          # STT/OCR/LLM 추출·정리 파이프라인
│     │  └─ src/              # 파이썬 모듈(패키지)
│     └─ evaluation/          # (선택) KoBERT 기반 평가 API
├─ frontend/                 # Expo(React Native) 앱
├─ example/                  # 예시 음성/이미지/텍스트 파일
└─ package.json              # 루트 실행 스크립트(backend/server, frontend 래핑)
```

### 백엔드 모듈 구조
- `auth`: 회원가입/로그인/JWT
- `users`: 사용자 조회
- `uploads`: 음성/이미지/텍스트 업로드
- `extracted-text`: STT/OCR/LLM 분석 결과 저장
- `analysis`: 피싱 유형 분류 + 스크립트 검증 + 통합 파이프라인
- `summaries`: 요약/키워드
- `scripts`: 시나리오 스크립트 생성
- `tts`: 통화형 시나리오 TTS 생성
- `logs`: 체험 로그 저장
- `experience`: 키워드 기반 시나리오 제공
- `ai`: 시나리오/음성 생성 서비스

### 프론트엔드 구조 및 화면
- **라우팅 구조**: `expo-router` 기반
  - `app/_layout.tsx`: Stack 네비게이션 루트
  - `app/(tabs)/_layout.tsx`: 하단 탭(홈/커뮤니티/피싱 뉴스/피싱 갤러리/마이 페이지)
- **주요 화면**
  - `app/(tabs)/index.tsx`: 홈
  - `app/(tabs)/community.tsx`: 커뮤니티
  - `app/(tabs)/news.tsx`: 피싱 뉴스
  - `app/(tabs)/gallery/index.tsx`: 피싱 갤러리 탭 메인
  - `app/upload/index.tsx`: 파일 업로드 + 분석 결과 카드
  - `app/gallery/*`: 전화/메시지 시뮬레이션, 리뷰, 결과
  - `app/guide/*`: 피해 대응 가이드
- **데이터 처리 방식**
  - 홈/커뮤니티/뉴스 일부는 목업 데이터 사용
  - 업로드 분석은 백엔드 API(`auth/auto -> uploads -> analysis/pipeline`) 연동

프론트엔드 상세 문서는 `frontend/README.md`를 참고하세요.

---

## 5. 아키텍처 개요 설명 (Conceptual Layer)
- **Hybrid 구조**: 
  - NestJS: API + 데이터 저장/관리
  - Python: STT/OCR/LLM 분석 파이프라인 실행
  - Expo: 모바일 체험 UI
- **역할 분리**:
  - 업로드/분석/요약/스크립트/음성 생성은 서버에서 처리
  - 앱은 결과 표시 + 체험 흐름 제어
- **분석 파이프라인**:
  - 텍스트/음성/이미지 입력 → STT/OCR → 정제 → 요약/키워드/리스크 점수
  - (신규) 추출 텍스트 기반 피싱 유형 분류 + 생성 스크립트 적절성 검증

---

## 6. 데이터 흐름 (Data Flow Layer)
```
사용자 앱
  │  (파일 업로드)
  ▼
NestJS API ───▶ backend/server/uploads/raw
  │
  ├─ extracted-text (Python extraction 실행)
  │     └─ backend/python/extraction/src 파이프라인으로 STT/OCR/LLM 분석 후 DB 저장
  │
  ├─ analysis (신규)
  │     ├─ classify: 추출 텍스트 기반 피싱 유형 분류
  │     ├─ validate-script: 생성된 스크립트 품질/정합성 검증
  │     └─ pipeline: 업로드→추출→분류→스크립트→검증 통합 실행
  │
  ├─ summaries → scripts → tts
  │
  └─ experience / logs
  ▼
SQLite (기본) 또는 PostgreSQL (Prisma)
```

---

## 7. 서비스 시나리오 (Runtime Flow Layer)
1. 사용자 가입/로그인
2. 음성/이미지/텍스트 파일 업로드
3. 업로드 파일 기반 STT/OCR/LLM 분석 실행
4. (신규) 추출 텍스트 기반 피싱 유형 분류 (단일 유형 + 신뢰도)
5. 요약 및 키워드 생성
6. 시나리오 스크립트 생성 (CHAT/CALL)
7. (신규) 생성된 스크립트 품질/정합성 검증
8. CALL 시나리오에 한해 TTS 생성
9. 앱에서 체험 진행 및 로그 저장
10. 키워드 기반 랜덤 시나리오 제공

---

## 8. API 명세 (Interface Layer – REST)
> 모든 보호된 API는 `Authorization: Bearer <token>` 필요

### Auth
- `POST /auth/register`  
  - Body: `{ email, password, name? }`
- `POST /auth/login`  
  - Body: `{ email, password }`
- `POST /auth/auto`  
  - Body: 없음 (게스트 자동 생성)
- `GET /auth/me`  
  - Auth 필요

### Uploads
- `POST /uploads`  
  - `multipart/form-data`  
  - 필드: `file`, `type`(VOICE|IMAGE|TEXT)
- `GET /uploads`  
  - Query: `type?`
- `GET /uploads/all` (ADMIN)
- `GET /uploads/:id`

### Extracted Text
- `POST /extracted-text/:uploadedFileId`
- `GET /extracted-text`
  - Query: `uploadedFileId?`
- `GET /extracted-text/all` (ADMIN)
- `GET /extracted-text/experience?keyword=...`
- `GET /extracted-text/:id/analysis`
- `GET /extracted-text/:id`

### Analysis (신규)
- `POST /analysis/classify`
  - Body: `{ uploadedFileId }`
  - Response 핵심:
    - `extractedText`
    - `predictedType` (`경찰 사칭 | 법원 사칭 | 택배 배송 사칭 | 자녀 사칭 | 해외 송금 사기 | 지인 사칭 | 일상 대화`)
    - `confidence`
    - `allScores`
    - `debug` (riskScore, keywordHits 등)
- `POST /analysis/validate-script`
  - Body: `{ script, expectedType }`
  - Response 핵심:
    - `score` (0~1)
    - `isValid`
    - `reason`
    - `debug` (문맥/자연스러움/위험도 하위 점수)
- `POST /analysis/pipeline`
  - Body: `{ uploadedFileId, scriptType?, expectedType?, script? }`
  - 용도: 업로드 파일 기준으로
    `텍스트 추출 → 유형 분류 → 스크립트 생성/재사용 → 스크립트 검증`
    을 한 번에 수행
  - Response 핵심:
    - `status` (`success` | `failed`)
    - `failedStage` (실패 단계 식별)
    - `stageResults` (각 단계 중간 결과 JSON)
    - `debug` (elapsedMs 등)

### Summaries
- `POST /summaries/:extractedTextId`
- `GET /summaries`
  - Query: `extractedTextId?`
- `GET /summaries/all` (ADMIN)
- `GET /summaries/:id`

### Scripts
- `POST /scripts/:summaryId`
  - Body: `{ type: CALL | CHAT }`
- `GET /scripts`
  - Query: `summaryId?`, `type?`
- `GET /scripts/all` (ADMIN)
- `GET /scripts/:id`

### TTS
- `POST /tts/:scriptId`
- `GET /tts`
  - Query: `scriptId?`
- `GET /tts/all` (ADMIN)
- `GET /tts/:id`

### Logs
- `POST /logs`
  - Body: `{ scriptId, ttsFileId?, log }`
- `GET /logs/me`
- `GET /logs/all` (ADMIN)
  - Query: `userId?`, `scriptId?`, `ttsFileId?`
- `GET /logs/:id`

### Experience
- `GET /experience/scenario?keyword=...&type=call|chat`
- `POST /experience/reply`
  - Body: `{ userMessage, sessionId?, keyword?, messages? }`

### Sessions (체험 세션/평가)
- `POST /sessions`
  - Body: `{ scriptId, channel, scriptVersion?, llmModelVersion? }`
- `POST /sessions/:id/messages`
  - Body: `{ turnIndex, speaker, text, maskedText?, timestamp? }`
- `POST /sessions/:id/events`
  - Body: `{ eventType, actionCode, riskWeight, stepNo?, timestamp? }`
- `POST /sessions/:id/survey`
  - Body: `{ answersJson, isSkipped? }`
- `POST /sessions/:id/evaluate`
  - Body: `{ promptVersion?, model? }`
- `GET /sessions/:id/evaluation`
  - Query: `jobId?`
- `POST /sessions/:id/finalize`
- `GET /sessions/:id/result`

### Users
- `GET /users/me`
- `GET /users` (ADMIN)
- `GET /users/:id` (ADMIN)

### LLM Feedback Dataset
- `POST /llm-feedback/ingest`
  - Body: `{ sessionId, inputFeaturesJson?, targetLabelJson?, qualityFlag?, reviewerId? }`

---

## 9. 파일 의존성 요약 (Code Navigation Layer)
- `controllers` → `services` → `prisma` → DB
- `dto`는 요청 검증(ValidationPipe) 경로
- `auth/guards`는 `JwtAuthGuard` + `RolesGuard` 조합
- 업로드 파일은 `backend/server/uploads/raw`, 생성 파일은 `backend/server/uploads/tts` 저장
- Python 분석 엔진은 `backend/python/extraction/src`를 사용 (NestJS가 파이썬을 직접 실행해 결과 JSON을 파싱)

---

## 10. 네이밍 규칙 (Convention Layer)
- TypeScript: `camelCase` 필드, `PascalCase` 클래스
- Enum 값: `UPPER_SNAKE` (예: `VOICE`, `CALL`)
- API Query/Body 필드: `camelCase`
- 환경변수: `UPPER_SNAKE`

---

## 11. 환경 변수 명세 (Deployment Layer)
### 백엔드 (`backend/server/.env`)
- `DATABASE_URL`
  - 기본(로컬): `file:./prisma/dev.db` (SQLite, `backend/server/prisma/` 기준 상대경로)
  - (선택) PostgreSQL 연결 문자열로 변경 가능
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (예: `1d`)
- `UPLOAD_DIR` (기본값: `uploads`)
- `UPLOAD_MAX_BYTES` (선택, 파일 크기 제한)
- `PORT` (기본값: `3000`)
- `HOST` (기본값: `0.0.0.0`)
- `CORS_ORIGIN` (선택, 콤마로 여러 도메인)
- `EXTRACTED_TEXT_PYTHON` (선택, `backend/python/extraction/.venv`의 python 절대 경로)
- `PYTHON_EXTRACTOR_PATH` (선택, 동일 목적)
- `EVALUATION_PYTHON` (선택, `backend/python/evaluation/.venv`의 python 절대 경로)

### 프론트엔드 (`frontend/.env`)
- `EXPO_PUBLIC_API_BASE_URL` (예: `http://192.168.0.10:3000`)

### Python (`backend/python/extraction/.env`)
- `OPENAI_API_KEY`
- `NAVER_OCR_SECRET` (선택)
- `NAVER_OCR_INVOKE_URL` (선택)
- `EVALUATION_API_URL` (선택, `evaluation` 서버 주소)
- `EVALUATION_API_TIMEOUT_SECONDS` (선택)

---

## 12. 실행 순서 (Runbook Layer)
**데모/재현 순서**
1. (선택) PostgreSQL 사용 시 DB 실행 및 `backend/server/.env`의 `DATABASE_URL` 설정  
   - 기본 로컬은 SQLite(`file:./prisma/dev.db`)로 바로 실행 가능합니다.
2. Python venv 준비 (`backend/python/extraction/.venv`)
3. Python venv 준비 (`backend/python/evaluation/.venv`) + KoBERT 가중치(`weights/kobert.pt`) 준비
4. (선택) `evaluation` API 사용 시 `backend/python/evaluation` 실행 + `EVALUATION_API_URL` 설정
5. NestJS 백엔드 실행 (`npm run start:dev`)
6. Expo 앱 실행 (`frontend`에서 `npm run start` 또는 `npm run frontend:start`)

---

필요 시 `example/` 폴더의 샘플 파일(음성/이미지/텍스트)로 업로드 흐름을 테스트할 수 있습니다.
