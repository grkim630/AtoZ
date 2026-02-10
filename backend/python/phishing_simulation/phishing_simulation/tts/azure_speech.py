"""
TTS: Azure Speech (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION).
"""
from __future__ import annotations

import os


def _use_azure_speech() -> bool:
    return bool(
        os.getenv("AZURE_SPEECH_KEY", "").strip()
        and os.getenv("AZURE_SPEECH_REGION", "").strip()
    )


def synthesize_speech(text: str) -> tuple[bytes, str]:
    """
    Returns (audio_bytes, content_type).
    content_type 예: audio/mpeg, audio/wav
    """
    if not _use_azure_speech():
        raise RuntimeError(
            "TTS를 쓰려면 .env에 AZURE_SPEECH_KEY와 AZURE_SPEECH_REGION을 설정하세요."
        )
    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        raise RuntimeError(
            "Azure Speech TTS를 쓰려면 pip install azure-cognitiveservices-speech 가 필요합니다."
        )

    key = os.getenv("AZURE_SPEECH_KEY", "").strip()
    region = os.getenv("AZURE_SPEECH_REGION", "").strip()
    # Default voice: male (InJoon). Override with AZURE_SPEECH_TTS_VOICE if desired.
    voice = os.getenv("AZURE_SPEECH_TTS_VOICE", "ko-KR-InJoonNeural").strip()

    speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
    speech_config.speech_synthesis_voice_name = voice
    # MP3로 내보내기
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
    )

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=None
    )
    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data, "audio/mpeg"
    if result.reason == speechsdk.ResultReason.Canceled:
        cancel = result.cancellation_details
        raise RuntimeError(f"Azure TTS 취소: {cancel.reason} - {cancel.error_details}")
    raise RuntimeError(f"Azure TTS 실패: {result.reason}")
