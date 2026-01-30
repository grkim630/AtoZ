# AtoZ 프론트엔드
ASCII HACKATHON 2026

피싱 범죄 실사례를 기반으로 모의 체험을 제공하는 Expo(React Native) 앱입니다.  
현재 화면 데이터는 로컬 상태/더미 배열로 렌더링되며, 업로드/분석 UI는 데모 흐름으로 구성되어 있습니다.

## 기술 스택
- Expo + React Native
- expo-router (네비게이션)
- TypeScript

## 실행 방법 (Windows PowerShell 기준)
```bash
cd C:\phishing-experience\frontend
npm install
npm run start
```

## 환경 변수
`frontend/.env`
- `EXPO_PUBLIC_API_BASE_URL`: 백엔드 API 주소  
  예) `http://192.168.0.10:3000`

## 스크립트
- `npm run start`: Expo 개발 서버 실행
- `npm run android`: Android 에뮬레이터 실행
- `npm run ios`: iOS 시뮬레이터 실행
- `npm run web`: 웹 실행
- `npm run lint`: lint

## 라우팅 구조 (expo-router)
- `app/_layout.tsx`: Stack 네비게이션 루트
- `app/(tabs)/_layout.tsx`: 하단 탭 레이아웃 (챗봇/홈/내 기록)

## 주요 화면
- `app/(tabs)/index.tsx`: 홈 화면 (전화/메시지 체험 진입, 트렌드 카드)
- `app/(tabs)/chatbot.tsx`: 챗봇 랜딩 및 업로드 진입
- `app/(tabs)/explore.tsx`: 내 기록 UI (프로필/저장/시청 목록)
- `app/upload.tsx`: 파일 업로드 대화형 UI (로컬 데모 흐름)
- `app/phone.tsx`: 전화 시나리오 목록
- `app/phone/police.tsx`: 전화 시나리오 영상 화면
- `app/message.tsx`: 메시지 시나리오 목록
- `app/message/child.tsx`: 메시지 채팅 체험

## 데이터 처리 방식
- 화면 렌더링 데이터는 더미 배열/로컬 상태 기반
- 업로드/분석 결과는 데모용 UI 흐름으로 표시

## 에셋
- 이미지: `assets/images`
- 영상: `assets/videos`
