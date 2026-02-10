from __future__ import annotations

import random

from .base import Channel, PhoneCategory, Scenario, ScenarioStage


def generate_phone_scenario(
    category: PhoneCategory,
    *,
    difficulty: int = 2,
    seed: int | None = None,
) -> Scenario:
    """
    전화 피싱 '체험' 시나리오 생성.

    - 목적: 교육/체험용으로, 실제 악용 가능한 요소(실제 링크/계좌/개인정보 수집)는 금지
    - difficulty: 1(약) ~ 3(강). 압박 강도/문장 톤에만 반영
    """
    rng = random.Random(seed)
    difficulty = max(1, min(3, int(difficulty)))

    pressure_pack = {
        1: ["가벼운 긴급성", "확인 요청"],
        2: ["시간 압박", "불안 조성", "권위 어필"],
        3: ["강한 시간 압박", "법적/금전적 불안", "권위+단정적 어조"],
    }[difficulty]

    common_red_lines = [
        "실제 주민번호/계좌번호/OTP/비밀번호를 요구하지 말 것(항상 '예시'/'가짜'로만)",
        "실제 URL 링크를 제공하지 말 것(항상 example.com 같은 더미)",
        "실제 금전 이체를 유도하지 말 것(항상 '가상 계좌/테스트 계좌' 표현)",
    ]

    if category == PhoneCategory.PROSECUTOR_POLICE:
        role = "수사기관 관계자(사칭)"
        objective = "사용자를 당황시키고, '안전 확인 절차'라는 명목으로 앱 설치/정보 입력을 유도"
        opening = rng.choice(
            [
                "여보세요, 본인 확인 좀 하겠습니다. 지금 통화 가능하십니까?",
                "안녕하세요. 급히 확인할 사항이 있어서 연락드렸습니다. 잠깐만요.",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="신뢰 확보(권위/공식 톤) + 긴급 분위기 조성",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="상황 제시",
                goal="모호한 '사건 연루'를 언급하며 불안을 높임(구체 증거는 흐리게)",
                pressure_tactics=pressure_pack + ["정보 비대칭(일부만 말하기)"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="압박",
                goal="지금 바로 조치해야 한다고 압박(시간/절차/비밀 유지)",
                pressure_tactics=pressure_pack + ["비밀 유지 강요", "즉시성"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크/가상 절차로 유도(교육용). 사용자가 의심/거절 시 말 바꾸기",
                pressure_tactics=pressure_pack + ["회유+압박 혼합"],
                red_lines=common_red_lines,
            ),
        ]

    elif category == PhoneCategory.FINANCIAL:
        role = "금융기관 고객센터(사칭)"
        objective = "비정상 거래/대출 등 '알림'으로 불안을 조성하고 절차를 따라오게 함"
        opening = rng.choice(
            [
                "고객님, 보안 확인 연락입니다. 방금 이상 거래 탐지되어 확인 필요합니다.",
                "안녕하세요. 고객님 계정에 보안 경고가 떠서 안내드리려고 연락드렸습니다.",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="고객센터 톤으로 시작, '안전' 키워드로 방어심리 낮추기",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="불안 고조",
                goal="모호한 거래/대출 시도 언급, 사용자가 부인하면 더 불안하게 만들기",
                pressure_tactics=pressure_pack + ["권위 어필", "긴급성"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="절차 유도",
                goal="보안 앱/인증 절차 '안내'라고 포장하여 유도(더미)",
                pressure_tactics=pressure_pack + ["절차 강요"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="개인정보 직접 요구 대신 '화면에서 예시 항목 입력' 같은 교육용 요구로 제한",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    elif category == PhoneCategory.FAMILY_FRIEND:
        role = "가족/지인(사칭)"
        objective = "감정(당황/걱정)을 이용해 사용자가 즉시 반응하게 만들기"
        opening = rng.choice(
            [
                "나야… 지금 잠깐 급한데 통화 돼?",
                "나 지금 급하게 연락했어. 잠깐만 들어봐.",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="감정적 톤으로 시작, 상황을 구체적으로 말하지 않고 급함만 강조",
                pressure_tactics=pressure_pack + ["감정 호소"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="상황 꼬기",
                goal="소리/환경 탓으로 신원 확인을 회피, 질문에는 애매하게 답하기",
                pressure_tactics=pressure_pack + ["회피", "혼란 유도"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="금전 요구 대신 '테스트 계좌' 등 더미 표현으로만 유도(교육용)",
                pressure_tactics=pressure_pack + ["미안함 유발", "시간 압박"],
                red_lines=common_red_lines,
            ),
        ]

    elif category == PhoneCategory.DELIVERY:
        role = "택배/배송 기사(사칭)"
        objective = "배송 문제/반송 등을 빌미로 사용자 행동(확인/앱 설치)을 유도"
        opening = rng.choice(
            [
                "고객님, 택배인데요. 주소 확인이 필요해서 연락드렸습니다.",
                "안녕하세요. 배송 관련해서 확인할 게 있어 전화드렸습니다.",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="일상 대화처럼 자연스럽게 시작해 방어심리 낮추기",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="문제 제시",
                goal="주소 오류/관세/보관료 같은 문제로 불편을 강조",
                pressure_tactics=pressure_pack + ["손해 회피 심리"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 링크/가짜 안내 절차로 유도(교육용)",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
        ]

    else:  # PhoneCategory.OVERSEAS_CRIME
        role = "해외 송금/범죄 연루 담당자(사칭)"
        objective = "심각한 범죄/해외 송금 키워드로 공포를 조성하고 즉시 협조를 유도"
        opening = rng.choice(
            [
                "본인 맞으시죠? 해외 송금 관련해서 확인할 게 있습니다. 지금 통화 가능하십니까?",
                "긴급 연락입니다. 해외 송금 건으로 본인 확인이 필요합니다.",
            ]
        )
        stages = [
            ScenarioStage(
                name="도입",
                goal="권위+긴급성으로 통제권 확보",
                pressure_tactics=pressure_pack,
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="공포 조성",
                goal="범죄 연루 가능성을 암시하며 사용자가 '증명'하려고 하게 만들기",
                pressure_tactics=pressure_pack + ["공포 조성", "정보 비대칭"],
                red_lines=common_red_lines,
            ),
            ScenarioStage(
                name="요구",
                goal="더미 절차로 협조를 유도(교육용). 사용자가 의심하면 톤을 바꾸어 재설득",
                pressure_tactics=pressure_pack + ["권위 어필", "시간 압박"],
                red_lines=common_red_lines,
            ),
        ]

    return Scenario(
        channel=Channel.PHONE,
        category=category.value,
        attacker_role=role,
        objective=objective,
        stages=stages,
        opening_line=opening,
    )

