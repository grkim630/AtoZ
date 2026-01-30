import json
from openai import OpenAI
from app.config import settings

# 키 없으면 여기서 예외가 나므로 main.py에서 try/except로 방어됨
client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM = """
너는 보이스피싱/스미싱 메시지를 분석하는 보안 분석기다.
사용자에게서 받은 텍스트만 근거로 다음 JSON만 출력해라.
절대 JSON 이외의 텍스트를 출력하지 마라.

출력 스키마:
{
  "summary": "한 문장 요약",
  "keywords": ["키워드 최대 7개"],
  "signals": ["아래 시그널 목록 중에서만 여러 개 선택"]
}

시그널 목록(여기서만 선택):
- shortened_url
- suspicious_url
- request_personal_info
- request_money
- urgency
- impersonation_gov
- impersonation_bank
- impersonation_delivery
- remote_app_install
- otp_request
- account_freeze_threat
- prize_scam
- refund_scam
- loan_scam
- investment_scam
- malware_apk
"""

def llm_extract(clean_text: str) -> dict:
    user = f"텍스트:\n{clean_text}"

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = resp.choices[0].message.content
    # content는 JSON string이므로 dict로 변환해서 반환
    return json.loads(content)
