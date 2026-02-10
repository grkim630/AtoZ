from __future__ import annotations

import random

from .base import Channel, MessageCategory, Scenario, ScenarioStage


def generate_message_scenario(
    category: MessageCategory,
    *,
    difficulty: int = 2,
    seed: int | None = None,
) -> Scenario:
    """
    문자(스미싱) '체험' 시나리오 생성.

    - 교육/체험 목적: 실제 악용 가능성이 있는 링크/정보/지시를 금지(더미로만)
    - difficulty: 1(약) ~ 3(강)
    """
    rng = random.Random(seed)
    difficulty = max(1, min(3, int(difficulty)))

    pressure_pack = {
        1: ["확인 요청", "가벼운 긴급성"],
        2: ["시간 압박", "불안 조성"],
        3: ["강한 시간 압박", "불안 조성", "단정적 경고 톤"],
    }[difficulty]

    common_red_lines = [
        "실제 URL 링크 제공 금지(항상 https://example.com 같은 더미)",
        "실제 금융정보/인증정보(OTP/비번) 수집 금지(항상 '예시' 표현)",
        "악성 앱 설치/원격 제어 지시 금지(항상 '보안 확인 페이지(더미)'로만)",
    ]

    if category == MessageCategory.DELIVERY:
        role = "택배사 알림(사칭)"
        objective = "배송 문제를 빌미로 링크 클릭을 유도(더미 링크)"
        opening = rng.choice(
            [
                "[택배] 주소 오류로 배송 보류. 오늘 내 확인 필요: https://example.com/delivery",
                "[택배] 보관 기간 만료 임박. 수령 정보 확인: https://example.com/pickup",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="일상적인 택배 알림처럼 시작",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="시간 압박",
                goal="오늘/몇 시간 내 조치가 필요하다는 메시지로 압박",
                pressure_tactics=pressure_pack + ["기한 제시"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크 클릭/정보 확인을 재차 유도(거절 시 문구 완화 후 재시도)",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    elif category == MessageCategory.FINANCIAL:
        role = "금융기관 알림(사칭)"
        objective = "비정상 결제/대출 시도 알림으로 사용자를 불안하게 하고 '확인'을 유도"
        opening = rng.choice(
            [
                "[알림] 비정상 결제 시도 감지. 10분 내 확인 필요: https://example.com/security",
                "[알림] 대출 신청 시도 확인 요청. 본인 아니면 즉시 차단: https://example.com/block",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="보안/차단 키워드로 즉시 반응 유도",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="불안 강화",
                goal="확인하지 않으면 손해가 발생할 수 있다고 암시",
                pressure_tactics=pressure_pack + ["손해 회피 심리"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크로 유도(사용자가 의심하면 고객센터 사칭 문구 추가)",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    elif category == MessageCategory.ACCOUNT_SUSPENDED:
        role = "계정 보안팀(사칭)"
        objective = "계정 정지/보안 경고로 공포를 조성해 조치를 유도(더미)"
        opening = rng.choice(
            [
                "[보안] 계정 로그인 차단 예정. 지금 확인: https://example.com/verify",
                "[경고] 비정상 접속 감지. 5분 내 재인증 필요: https://example.com/auth",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="정지/차단 같은 강한 키워드로 긴급성 부여",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="권위+압박",
                goal="보안 정책/절차를 언급하며 단정적으로 압박",
                pressure_tactics=pressure_pack + ["권위 어필", "기한 제시"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크/더미 인증으로만 유도",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    else:  # MessageCategory.FRIEND_LINK
        role = "지인(사칭)"
        objective = "짧은 메시지+링크로 클릭을 유도(더미 링크)"
        # 로맨스/지인 사칭류는 오프닝이 반복되기 쉬워 템플릿+변형을 넉넉히 둔다.
        # (교육/체험 목적: 링크는 항상 더미, 실제 악용 가능한 지시 금지)
        friend_names = ["민지", "서준", "지훈", "유진", "수아", "현우", "지민", "예린"]
        emojis = ["", "ㅠㅠ", "ㅜㅜ", "😥", "😳", "🙏", "💬"]
        hooks = [
            "야 이거 너 맞아?",
            "이거 너 사진 맞지?",
            "혹시 너 맞아? 갑자기 떠서;;",
            "나 지금 좀 급한데 잠깐만 봐줘",
            "미안 갑자기 연락해서… 확인 좀",
            "지금 시간 돼? 1분만",
        ]
        romance_hooks = [
            "혹시 소개팅 앱에서 만난 {name} 기억나?",
            "{name}가 방금 이상한 링크를 보냈는데 너도 받았어?",
            "나 {name}한테 연락 왔는데 좀 수상해…",
            "{name}가 '확인만 해달라'고 하는데 이거 괜찮은 거야?",
        ]
        paths = ["pic", "doc", "profile", "check", "msg", "notice", "verify"]
        opening_templates = [
            "{hook} {emoji} https://example.com/{path}",
            "{hook} {emoji} 링크만 한번 봐줘 https://example.com/{path}",
            "야… {hook} {emoji} https://example.com/{path}",
            "급함 {emoji} {hook} https://example.com/{path}",
            "이거 나한테 온 건데… {hook} {emoji} https://example.com/{path}",
            "너한테도 이거 왔어? {emoji} https://example.com/{path}",
            # 로맨스/소개팅 톤 변형
            "{romance_hook} {emoji} https://example.com/{path}",
            "혹시 {name} 관련해서 확인할 게 있어 {emoji} https://example.com/{path}",
        ]
        opening = rng.choice(opening_templates).format(
            hook=rng.choice(hooks),
            romance_hook=rng.choice(romance_hooks).format(name=rng.choice(friend_names)),
            name=rng.choice(friend_names),
            emoji=rng.choice(emojis),
            path=rng.choice(paths),
        ).replace("  ", " ").strip()
        stages = [
            ScenarioStage(
                name="도입",
                goal="짧고 가벼운 톤으로 클릭 유도",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="감정/호기심 자극",
                goal="호기심, 놀람, 급함을 섞어 압박",
                pressure_tactics=pressure_pack + ["호기심 자극", "급함"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크 재유도(거절 시 '오해했나'로 톤 전환)",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    return Scenario(
        channel=Channel.MESSAGE,
        category=category.value,
        attacker_role=role,
        objective=objective,
        stages=stages,
        opening_line=opening,
    )

