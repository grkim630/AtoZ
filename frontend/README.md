# Frontend README

시시콜콜 프론트엔드(Expo + React Native) 전용 문서입니다.  
이 문서는 **프론트 실행/구조/백엔드 연동 포인트**를 빠르게 파악하기 위한 목적입니다.

---

## 1) 기술 스택

- Expo SDK 54
- React Native 0.81
- React 19
- `expo-router` 기반 파일 라우팅
- `react-native-safe-area-context`
- `react-native-svg`, `react-native-svg-transformer`
- 네트워크 통신: `fetch` (서비스 레이어: `src/services/analysisService.ts`)

---

## 2) 실행 방법

### 2-1. 의존성 설치

```bash
cd C:\phishing-experience\phishing-experience\frontend
npm install
```

### 2-2. 앱 실행

```bash
npm run start
```

필요 시 플랫폼별:

```bash
npm run android
npm run ios
npm run web
```

> 참고: 현재 `frontend/package.json`의 스크립트는 위 4개(start/android/ios/web)만 정의되어 있습니다.

---

## 3) 환경 변수

프론트 `.env` 파일:

```env
EXPO_PUBLIC_API_BASE_URL=http://<백엔드_주소>:3000
EXPO_PUBLIC_SIMULATION_API_BASE_URL=http://<시뮬레이션_서버_주소>:8010
```

예시:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:3000
EXPO_PUBLIC_SIMULATION_API_BASE_URL=http://192.168.0.10:8010
```

> 모바일 기기 테스트 시 `localhost` 대신 **서버가 떠 있는 PC의 LAN IP**를 사용해야 합니다.

---

## 4) 폴더 구조 (핵심)

```text
frontend/
├─ app/
│  ├─ _layout.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx           # 홈
│  │  ├─ community.tsx
│  │  ├─ news.tsx
│  │  ├─ mypage.tsx
│  │  └─ gallery/
│  │     ├─ _layout.tsx
│  │     ├─ index.tsx
│  │     └─ result.tsx
│  ├─ upload/
│  │  └─ index.tsx           # 파일 업로드 + 분석 결과 카드
│  ├─ gallery/               # 시나리오/리뷰/결과 화면
│  └─ guide/
├─ src/
│  ├─ constants/
│  └─ services/
│     ├─ analysisService.ts  # 백엔드 연동 핵심
│     ├─ mockData.ts
│     └─ types.ts
├─ assets/
├─ app.json
└─ package.json
```

---

## 5) 라우팅 개요

- 루트: `app/_layout.tsx`
- 탭: `app/(tabs)/_layout.tsx`
  - 홈: `/(tabs)`
  - 커뮤니티: `/(tabs)/community`
  - 뉴스: `/(tabs)/news`
  - 피싱 갤러리: `/(tabs)/gallery`
  - 마이페이지: `/(tabs)/mypage`
- 업로드: `/upload`

---

## 6) 백엔드 연동 흐름 (업로드 분석)

현재 업로드 분석 플로우는 `src/services/analysisService.ts`에서 처리합니다.

1. `POST /auth/auto`  
   - 게스트 토큰 발급
2. `POST /uploads`  
   - multipart 업로드 (`file`, `type`)
3. `POST /analysis/pipeline`  
   - `{ uploadedFileId }` 전달
4. 응답을 프론트 UI 모델로 매핑  
   - label/riskScore/차트 데이터/유형/요약 텍스트

연동 사용 위치:

- `app/upload/index.tsx`

---

## 7) 분석 결과 UI 매핑 규칙

`analysisService.ts`에서 아래 매핑을 수행합니다.

- `stageResults.classification.debug.riskLabel` -> `label` (`phishing`/`normal`)
- `stageResults.classification.debug.riskScore` -> `riskScore`  
  - 0~1 또는 0~100 입력 모두 허용
  - UI 표시는 `Math.floor` 적용
- `stageResults.classification.predictedType` -> `verdictTitle`
- `stageResults.extraction.summary` -> `verdictDescription`

차트 규칙:

- 종합 바: `riskScore` 그대로 반영
- 하위 바(문맥/단어): 랜덤 분산 + 평균은 `riskScore` 유지
- 평균 위험도 바: 시각 최대 80% 캡 적용

---

## 8) 주요 파일별 책임

- `app/upload/index.tsx`
  - 파일 선택(문서/이미지)
  - 분석 로딩/결과 카드 렌더링
- `src/services/analysisService.ts`
  - API 호출/재시도/응답 매핑
  - 마지막 분석 결과 캐시 제공
- `app/(tabs)/gallery/result.tsx`, `app/gallery/result.tsx`
  - `getLastAnalysisResult()`를 이용한 결과 표시

---

## 9) 개발 시 주의사항

- `app/(tabs)` 아래 동일 route name 파일/폴더 중복 금지  
  - 예: `gallery.tsx` + `gallery/index.tsx` 동시 존재 시 네비게이터 충돌
- UI 컴포넌트 구조를 크게 바꾸기보다 서비스 매핑을 통해 연결
- `.env`의 민감 정보는 커밋 금지

---

## 10) 자주 발생하는 문제

### Q1. 업로드 시 `Network request failed`
- `EXPO_PUBLIC_API_BASE_URL` 확인
- 모바일 기기와 백엔드 서버가 같은 네트워크인지 확인
- 백엔드 실행 상태 확인

### Q2. 분석 요청 실패(백엔드 4xx/5xx)
- 프론트 경고창에 표시된 메시지 확인
- 백엔드 터미널에서 `/uploads`, `/analysis/pipeline` 로그 확인

### Q3. 탭 화면이 열리지 않고 duplicate screen 에러 발생
- `(tabs)` 폴더 내 중복 라우트 파일 확인

---

## 11) 참고

- 루트 통합 문서: `../README.md`
- 프론트 서비스 연동 핵심: `src/services/analysisService.ts`
 - 시뮬레이션 API 연동(전화/문자 체험): `src/services/phishingSimulationService.ts`
