import re

# ✅ 1) 기본 키워드 (기존 유지 + 약간 보강)
URGENCY_WORDS = [
    "지금", "즉시", "오늘까지", "긴급", "바로", "곧", "마감", "제한시간",
    "미확인 시", "반송", "보관", "보관료", "자동", "즉시 조치"
]

INSTALL_WORDS = [
    "앱 설치", "어플 설치", "원격", "팀뷰어", "anydesk", "애니데스크",
    "퀵서포트", "원격지원", "설치해주세요", "설치 후"
]

MONEY_WORDS = [
    "대출", "수수료", "입금", "송금", "계좌", "보증금", "환급", "세금", "벌금",
    "결제", "승인", "청구", "카드", "이체", "출금", "한도"
]

AUTH_WORDS = [
    "인증번호", "OTP", "보안카드", "비밀번호", "아이디", "로그인",
    "본인확인", "본인 인증", "인증 요청", "계정", "재설정"
]

AGENCY_WORDS = [
    "검찰", "경찰", "금감원", "국세청", "은행", "택배", "고객센터", "법원",
    "금융감독원", "국세", "카드사", "배송", "관세"
]

# ✅ 2) 패턴 탐지 (키워드 없더라도 잡히게 하는 핵심)
URL_PATTERN = re.compile(
    r"\[URL\]|\bhttps?://|\bwww\.|"
    r"\bbit\.ly\b|\bt\.co\b|\bgoo\.gl\b|\bme2\.do\b",
    re.IGNORECASE
)

PHONE_PATTERN = re.compile(r"\b0\d{1,2}[- ]?\d{3,4}[- ]?\d{4}\b")  # 010-1234-5678 / 02-123-4567
MONEY_AMOUNT_PATTERN = re.compile(r"\b\d{1,3}(?:,\d{3})+\s*원\b|\b\d+\s*원\b")  # 12,000원 / 3000원
ACCOUNT_LIKE_PATTERN = re.compile(r"\b\d{2,4}[- ]?\d{2,4}[- ]?\d{2,6}\b")  # 계좌/거래번호처럼 생긴 숫자
SHORT_LINK_WORDS = ["bit.ly", "me2.do", "t.co", "tinyurl", "goo.gl"]

# ✅ 3) 룰 기반 시그널
def detect_signals(clean_text: str) -> list[str]:
    t = clean_text or ""
    s = set()

    # URL/링크 유도
    if URL_PATTERN.search(t) or any(x in t.lower() for x in SHORT_LINK_WORDS):
        s.add("URL유도")

    # 긴급/압박
    if any(w in t for w in URGENCY_WORDS):
        s.add("긴급성")

    # 설치/원격 유도
    if any(w.lower() in t.lower() for w in INSTALL_WORDS):
        s.add("앱설치/원격유도")

    # 인증/계정 정보 요구
    if any(w in t for w in AUTH_WORDS):
        s.add("인증/계정정보요구")

    # 금전 요구/유도
    if any(w in t for w in MONEY_WORDS):
        s.add("금전요구/유도")

    # 기관/회사 사칭 가능
    if any(w in t for w in AGENCY_WORDS):
        s.add("기관/회사사칭가능")

    # ✅ 패턴 기반 보강(키워드 없어도 위험감지)
    if PHONE_PATTERN.search(t):
        s.add("연락유도(전화번호)")

    if MONEY_AMOUNT_PATTERN.search(t):
        s.add("금액언급")

    # 계좌/거래번호처럼 보이는 숫자열이 있으면(오탐 가능성 있어 가중치 낮게)
    if ACCOUNT_LIKE_PATTERN.search(t) and any(w in t for w in ["계좌", "이체", "입금", "송금", "거래", "환급"]):
        s.add("계좌/거래정보단서")

    return sorted(s)


# ✅ 4) 위험도 스코어 (설명 가능한 가중치 방식 유지)
def score_risk(signals: list[str]) -> int:
    weights = {
        "URL유도": 30,
        "긴급성": 15,
        "앱설치/원격유도": 35,
        "인증/계정정보요구": 25,
        "금전요구/유도": 25,
        "기관/회사사칭가능": 10,

        # 추가 시그널(보조 지표)
        "연락유도(전화번호)": 10,
        "금액언급": 10,
        "계좌/거래정보단서": 10,
    }
    score = sum(weights.get(s, 0) for s in signals)
    return max(0, min(100, score))
