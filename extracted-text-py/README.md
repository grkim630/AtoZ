# AtoZ
ASCII HACKATHON 2026

## NestJS 실행 조건
- NestJS는 `extracted-text-py/.venv/Scripts/python.exe`를 절대 경로로 사용해야 합니다.
- `EXTRACTED_TEXT_PYTHON`을 사용한다면 반드시 위 venv 경로의 절대 경로로 지정하세요.
- 시스템 Python은 차단되며, OpenAI SDK `responses` API 지원 여부를 실행 전에 검증합니다.
