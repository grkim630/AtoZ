import io
from openai import OpenAI
from src.config import settings

# 데모용 STT 텍스트 (키 없거나 실패할 때)
DEMO_STT_TEXT = (
    "[데모 STT] 안녕하세요 고객님. 고객님의 계좌가 일시 정지되었습니다. "
    "본인 확인을 위해 인증번호를 입력해야 합니다. 아래 링크를 클릭해 주세요: https://bit.ly/demo"
)

def stt_transcribe(audio_bytes: bytes, filename: str) -> str:
    """
    audio_bytes: 업로드된 음성 파일 바이트
    filename: 확장자 포함 파일명 (m4a/mp3/wav 등)
    """
    # ✅ 키가 없으면 데모 모드로 바로 반환 (발표 안전장치)
    if not getattr(settings, "OPENAI_API_KEY", None):
        return DEMO_STT_TEXT

    # OpenAI SDK는 file-like를 받는 형태가 편함
    bio = io.BytesIO(audio_bytes)
    bio.name = filename  # 확장자 추정용

    # ✅ client는 함수 내부에서 생성 (import 시점 에러 방지)
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    transcript = client.audio.transcriptions.create(
        model="gpt-4o-mini-transcribe",
        file=bio,
    )
    return transcript.text or ""


