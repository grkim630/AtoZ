import re

URGENCY_WORDS = ["지금", "즉시", "오늘까지", "긴급", "바로", "곧", "마감", "제한시간"]
INSTALL_WORDS = ["앱 설치", "어플 설치", "원격", "팀뷰어", "anydesk", "애니데스크", "퀵서포트"]
MONEY_WORDS = ["대출", "수수료", "입금", "송금", "계좌", "보증금", "환급", "세금", "벌금"]
AUTH_WORDS = ["인증번호", "OTP", "보안카드", "비밀번호", "아이디", "로그인"]
AGENCY_WORDS = ["검찰", "경찰", "금감원", "국세청", "은행", "택배", "고객센터", "법원"]

URL_PATTERN = re.compile(r"\[URL\]|\bhttps?://|\bwww\.", re.IGNORECASE)

def detect_signals(clean_text: str) -> list[str]:
    s = set()

    if URL_PATTERN.search(clean_text):
        s.add("URL유도")

    if any(w in clean_text for w in URGENCY_WORDS):
        s.add("긴급성")

    if any(w.lower() in clean_text.lower() for w in INSTALL_WORDS):
        s.add("앱설치/원격유도")

    if any(w in clean_text for w in AUTH_WORDS):
        s.add("인증/계정정보요구")

    if any(w in clean_text for w in MONEY_WORDS):
        s.add("금전요구/유도")

    if any(w in clean_text for w in AGENCY_WORDS):
        s.add("기관/회사사칭가능")

    return sorted(s)

def score_risk(signals: list[str]) -> int:
    weights = {
        "URL유도": 30,
        "긴급성": 15,
        "앱설치/원격유도": 35,
        "인증/계정정보요구": 25,
        "금전요구/유도": 25,
        "기관/회사사칭가능": 10,
    }
    score = sum(weights.get(s, 0) for s in signals)
    return max(0, min(100, score))
