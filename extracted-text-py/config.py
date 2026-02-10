from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    OPENAI_API_KEY: str

    # (선택) 네이버 CLOVA OCR
    NAVER_OCR_SECRET: str | None = None
    NAVER_OCR_INVOKE_URL: str | None = None

    # (선택) evaluation-py 추론 API (예: http://127.0.0.1:8010)
    # 설정 시 extracted-text-py가 cleanText를 평가 API로 전달해 결과를 합쳐 반환합니다.
    EVALUATION_API_URL: str | None = None
    EVALUATION_API_TIMEOUT_SECONDS: float = 5.0

settings = Settings()
