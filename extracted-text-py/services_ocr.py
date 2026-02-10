import base64
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def ocr_extract_text(image_bytes: bytes) -> str:
    """
    OpenAI Vision으로 이미지 내 텍스트를 추출합니다.
    - 줄바꿈 유지
    - 보이는 텍스트만(추측 금지)
    """
    b64 = base64.b64encode(image_bytes).decode("utf-8")

    # data URL로 넣으면 파일 업로드 없이도 이미지 전달 가능
    data_url = f"data:image/png;base64,{b64}"

    resp = client.responses.create(
        model="gpt-4.1-mini",
        input=[{
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": (
                        "아래 이미지에서 보이는 텍스트를 가능한 그대로 추출해줘.\n"
                        "- 줄바꿈을 유지해줘\n"
                        "- 보이지 않는 내용은 절대 추측하지 마\n"
                        "- 이모지/기호/숫자도 보이는대로 포함해줘\n"
                    )
                },
                {
                    "type": "input_image",
                    "image_url": data_url
                }
            ]
        }],
        max_output_tokens=800,
    )

    return (resp.output_text or "").strip()

