import re

PHONE_RE = re.compile(r"\b(01[016789])[-.\s]?(\d{3,4})[-.\s]?(\d{4})\b")
RRN_RE = re.compile(r"\b(\d{6})[-\s]?(\d{7})\b")  # 주민번호
ACCT_RE = re.compile(r"\b(\d{2,6})[-\s]?(\d{2,6})[-\s]?(\d{2,6})\b")  # 계좌(대충)
URL_RE = re.compile(r"(https?://\S+|www\.\S+)", re.IGNORECASE)

def mask_sensitive(text: str) -> str:
    t = text

    # URL은 그대로 두는 편이 분석에 유리. 대신 표시만.
    t = URL_RE.sub("[URL]", t)

    # 전화번호
    t = PHONE_RE.sub(r"\1-****-\3", t)

    # 주민번호
    t = RRN_RE.sub(r"\1-*******", t)

    # 계좌번호(오탐 가능성 높아서 최소 마스킹만)
    # 길게 숫자-숫자-숫자 형태면 마스킹
    t = ACCT_RE.sub("[ACCOUNT]", t)

    return t
