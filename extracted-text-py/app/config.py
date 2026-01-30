from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    OPENAI_API_KEY: str

    # (선택) 네이버 CLOVA OCR
    NAVER_OCR_SECRET: str | None = None
    NAVER_OCR_INVOKE_URL: str | None = None

settings = Settings()
