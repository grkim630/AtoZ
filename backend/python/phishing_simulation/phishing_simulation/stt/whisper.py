"""
STT: Azure Speech(키+리전) 우선, 없으면 OpenAI Whisper.
- Azure Speech: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
- OpenAI: OPENAI_API_KEY, OPENAI_STT_MODEL(기본 whisper-1)
"""
from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path

from fastapi import UploadFile


class _NamedBytesIO(io.BytesIO):
    def __init__(self, data: bytes, name: str):
        super().__init__(data)
        self.name = name


def _use_azure_speech() -> bool:
    return bool(
        os.getenv("AZURE_SPEECH_KEY", "").strip()
        and os.getenv("AZURE_SPEECH_REGION", "").strip()
    )


def _transcribe_with_azure_speech(file_bytes: bytes, filename: str) -> str:
    """Azure Speech Services (키+리전) STT."""
    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        raise RuntimeError(
            "Azure Speech STT를 쓰려면 pip install azure-cognitiveservices-speech 가 필요합니다."
        )

    key = os.getenv("AZURE_SPEECH_KEY", "").strip()
    region = os.getenv("AZURE_SPEECH_REGION", "").strip()
    if not key or not region:
        raise RuntimeError("AZURE_SPEECH_KEY와 AZURE_SPEECH_REGION이 필요합니다.")

    # 지원 포맷: wav 권장. 다른 포맷은 임시 파일 확장자로 시도
    ext = Path(filename).suffix.lower() or ".wav"
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
        f.write(file_bytes)
        path = f.name
    try:
        speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
        speech_config.speech_recognition_language = "ko-KR"
        audio_config = speechsdk.audio.AudioConfig(filename=path)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config,
        )
        result = recognizer.recognize_once()
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return (result.text or "").strip()
        if result.reason == speechsdk.ResultReason.NoMatch:
            return ""
        raise RuntimeError(f"Azure Speech 인식 실패: {result.reason}")
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def _get_azure_openai_stt_deployment() -> str:
    return os.getenv("AZURE_OPENAI_STT_DEPLOYMENT", "").strip()


def _transcribe_with_openai(file_bytes: bytes, filename: str) -> str:
    """OpenAI Whisper STT."""
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "STT: OPENAI_API_KEY가 필요합니다. (Azure Speech 사용 시에는 AZURE_SPEECH_KEY, AZURE_SPEECH_REGION 설정)"
        )
    model = os.getenv("OPENAI_STT_MODEL", "whisper-1").strip()
    client = OpenAI(api_key=api_key)
    audio_file = _NamedBytesIO(file_bytes, name=filename)
    result = client.audio.transcriptions.create(model=model, file=audio_file)
    return (result.text or "").strip()


def _transcribe_with_azure_openai(file_bytes: bytes, filename: str) -> str:
    """Azure OpenAI Whisper 배포 STT (선택)."""
    from openai import AzureOpenAI

    deployment = _get_azure_openai_stt_deployment()
    if not deployment:
        raise RuntimeError("AZURE_OPENAI_STT_DEPLOYMENT가 필요합니다.")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
    api_key = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview").strip()
    if not endpoint or not api_key:
        raise RuntimeError("AZURE_OPENAI_ENDPOINT와 AZURE_OPENAI_API_KEY가 필요합니다.")

    client = AzureOpenAI(
        api_key=api_key, azure_endpoint=endpoint, api_version=api_version
    )
    audio_file = _NamedBytesIO(file_bytes, name=filename)
    result = client.audio.transcriptions.create(model=deployment, file=audio_file)
    return (result.text or "").strip()


async def transcribe_upload(upload: UploadFile) -> str:
    file_bytes = await upload.read()
    filename = upload.filename or "audio.webm"

    # 1) Azure Speech (키+리전) 우선. 실패 시(포맷 미지원 등) OpenAI로 폴백
    if _use_azure_speech():
        try:
            return _transcribe_with_azure_speech(file_bytes, filename)
        except Exception:
            pass
    # 2) Azure OpenAI Whisper 배포 (있을 때만)
    if _get_azure_openai_stt_deployment():
        return _transcribe_with_azure_openai(file_bytes, filename)
    # 3) OpenAI Whisper
    return _transcribe_with_openai(file_bytes, filename)
