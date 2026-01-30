# AtoZ

피싱 범죄 실사례(통화 녹음 파일, SNS 스크린캡처본)를 공유하고, 실사례를 바탕으로 모의 피싱 범죄 체험 앱을 제작하는 프로젝트입니다.  
디지털 소외 계층이 피싱 범죄를 학습하고 모의 체험을 통해 예방 능력을 높이는 것을 목표로 합니다.

- 소속: 중앙대학교 예술공학과, ASCII HACKATHON 2026
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
**프로젝트 이름**: AtoZ  
**프로젝트 설명**: 피싱 범죄 실사례(통화 녹음 파일, SNS 스크린캡처본)를 공유하고, 실사례를 바탕으로 모의 피싱 범죄 체험 앱 제작  
**목적**: 디지털 소외 계층 대상 피싱 범죄 학습 및 모의 체험을 통한 예방 방식 확장  
**소속 / 성격**: 중앙대학교 예술공학과, ASCII HACKATHON 2026 참여  

**팀원 및 역할**
- 배기현(팀장): 기획, STT, OCR, LLM 기반 API 구축
- 김강륜: 백엔드 개발 및 서버 구축
- 이화: 기획, 발표, UX/UI 디자이너
- 차예은: UX/UI 디자이너, Frontend 개발
- 홍준택: TTS 기반 API 구축

---

## 2. 협업 규칙 & Git 전략 (Collaboration Layer)
> 이 프로젝트에 참여하려면 어떻게 일해야 하는가

- **브랜치 전략**: `main`(배포/데모용) + `dev`(통합) + `name`(개인 작업)
- **개인 브랜치 정책**: 개인 작업은 `<name>` 브랜치에서 진행
- **머지 정책**: `name` → `dev`로 PR 머지, `dev` → `main`은 팀장 승인 후 진행
- **직접 push 금지**: `main`에는 직접 push 금지
- **커밋 메시지 규칙**: `type: short message` (예: `feat: add upload endpoint`)
- **의존성 공유 규칙**: 
  - 백엔드: `package-lock.json` 커밋 필수
  - 프론트: `frontend/package-lock.json` 커밋 필수
  - Python: `extracted-text-py/requirements.txt`로 관리

---

## 3. 개발 환경 & 실행 가이드 (Onboarding Layer)
> 새 팀원이 30분 안에 실행 가능한 수준을 목표로 합니다.

### 백엔드 (NestJS)
**PowerShell 기준**
```bash
cd C:\phishing-experience
npm install
npx prisma generate
npm run start:dev
```

### 분석 파이프라인 (Python)
`extracted-text-py/.venv`의 Python만 허용됩니다. (시스템 Python 차단)
```bash
cd C:\phishing-experience\extracted-text-py
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

### 프론트엔드 (Expo)
```bash
cd C:\phishing-experience\frontend
npm install
npm run start
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
phishing-experience/
├─ src/                      # NestJS 백엔드
├─ frontend/                 # Expo(React Native) 앱
├─ prisma/                   # DB 스키마
├─ extracted-text-py/        # STT/OCR/LLM 파이썬 파이프라인
├─ uploads/                  # 업로드/생성 파일 저장
├─ example/                  # 예시 음성/이미지/텍스트 파일
└─ dist/                     # 빌드 결과물
```

### 백엔드 모듈 구조
- `auth`: 회원가입/로그인/JWT
- `users`: 사용자 조회
- `uploads`: 음성/이미지/텍스트 업로드
- `extracted-text`: STT/OCR/LLM 분석 결과 저장
- `summaries`: 요약/키워드
- `scripts`: 시나리오 스크립트 생성
- `tts`: 통화형 시나리오 TTS 생성
- `logs`: 체험 로그 저장
- `experience`: 키워드 기반 시나리오 제공
- `ai`: 시나리오/음성 생성 서비스

### 프론트엔드 구조 및 화면
- **라우팅 구조**: `expo-router` 기반
  - `app/_layout.tsx`: Stack 네비게이션 루트
  - `app/(tabs)/_layout.tsx`: 하단 탭(챗봇/홈/내 기록)
- **주요 화면**
  - `app/(tabs)/index.tsx`: 홈(전화/메시지 체험 진입, 트렌드 카드)
  - `app/(tabs)/chatbot.tsx`: 챗봇 랜딩 및 업로드 진입
  - `app/(tabs)/explore.tsx`: 내 기록 UI(프로필/저장/시청 목록)
  - `app/upload.tsx`: 파일 업로드 대화형 UI(로컬 상태 기반 데모 흐름)
  - `app/phone.tsx`, `app/phone/police.tsx`: 전화 시나리오 목록/영상 화면
  - `app/message.tsx`, `app/message/child.tsx`: 메시지 시나리오 목록/채팅 체험
- **데이터 처리 방식**
  - 현재 화면 데이터는 로컬 상태/더미 배열로 렌더링
  - 업로드/분석 결과 UI는 데모 흐름으로 표시

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

---

## 6. 데이터 흐름 (Data Flow Layer)
```
사용자 앱
  │  (파일 업로드)
  ▼
NestJS API ───▶ uploads/raw
  │
  ├─ extracted-text (Python 실행)
  │     └─ STT/OCR/LLM 분석 결과 저장
  │
  ├─ summaries → scripts → tts
  │
  └─ experience / logs
  ▼
PostgreSQL (Prisma)
```

---

## 7. 서비스 시나리오 (Runtime Flow Layer)
1. 사용자 가입/로그인
2. 음성/이미지/텍스트 파일 업로드
3. 업로드 파일 기반 STT/OCR/LLM 분석 실행
4. 요약 및 키워드 생성
5. 시나리오 스크립트 생성 (CHAT/CALL)
6. CALL 시나리오에 한해 TTS 생성
7. 앱에서 체험 진행 및 로그 저장
8. 키워드 기반 랜덤 시나리오 제공

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

---

## 9. 파일 의존성 요약 (Code Navigation Layer)
- `controllers` → `services` → `prisma` → DB
- `dto`는 요청 검증(ValidationPipe) 경로
- `auth/guards`는 `JwtAuthGuard` + `RolesGuard` 조합
- 업로드 파일은 `uploads/raw`, 생성 파일은 `uploads/tts` 저장

---

## 10. 네이밍 규칙 (Convention Layer)
- TypeScript: `camelCase` 필드, `PascalCase` 클래스
- Enum 값: `UPPER_SNAKE` (예: `VOICE`, `CALL`)
- API Query/Body 필드: `camelCase`
- 환경변수: `UPPER_SNAKE`

---

## 11. 환경 변수 명세 (Deployment Layer)
### 백엔드 (`.env`)
- `DATABASE_URL` (PostgreSQL 연결 문자열)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (예: `1d`)
- `UPLOAD_DIR` (기본값: `uploads`)
- `UPLOAD_MAX_BYTES` (선택, 파일 크기 제한)
- `PORT` (기본값: `3000`)
- `HOST` (기본값: `0.0.0.0`)
- `CORS_ORIGIN` (선택, 콤마로 여러 도메인)
- `EXTRACTED_TEXT_PYTHON` (선택, `extracted-text-py/.venv`의 python 절대 경로)
- `PYTHON_EXTRACTOR_PATH` (선택, 동일 목적)

### 프론트엔드 (`frontend/.env`)
- `EXPO_PUBLIC_API_BASE_URL` (예: `http://192.168.0.10:3000`)

### Python (`extracted-text-py/.env`)
- `OPENAI_API_KEY`
- `NAVER_OCR_SECRET` (선택)
- `NAVER_OCR_INVOKE_URL` (선택)

---

## 12. 실행 순서 (Runbook Layer)
**데모/재현 순서**
1. PostgreSQL 실행 및 `DATABASE_URL` 설정
2. Python venv 준비 (`extracted-text-py/.venv`)
3. NestJS 백엔드 실행 (`npm run start:dev`)
4. Expo 앱 실행 (`frontend`에서 `npm run start`)

---

필요 시 `example/` 폴더의 샘플 파일(음성/이미지/텍스트)로 업로드 흐름을 테스트할 수 있습니다.
