from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Channel(str, Enum):
    PHONE = "phone"
    MESSAGE = "message"


class PhoneCategory(str, Enum):
    PROSECUTOR_POLICE = "검찰/경찰 사칭"
    FINANCIAL = "금융기관 사칭"
    FAMILY_FRIEND = "자녀/지인 사칭"
    DELIVERY = "택배/배송 사칭"
    OVERSEAS_CRIME = "해외 송금/범죄 연루 사칭"


class MessageCategory(str, Enum):
    DELIVERY = "택배 문자"
    FINANCIAL = "금융기관 알림"
    ACCOUNT_SUSPENDED = "계정 정지/보안 경고"
    FRIEND_LINK = "지인 사칭 링크"


class ScenarioStage(BaseModel):
    name: str = Field(..., description="단계명 (도입/압박/요구 등)")
    goal: str = Field(..., description="해당 단계에서 달성하려는 목표(시뮬레이션용)")
    pressure_tactics: list[str] = Field(
        default_factory=list,
        description="심리적 압박 장치(시간 압박, 불안 조성 등) - 교육용 시뮬레이션",
    )
    red_lines: list[str] = Field(
        default_factory=list,
        description="절대 하지 말아야 할 것(실제 개인정보/실제 링크/실제 계좌 등)",
    )


class Scenario(BaseModel):
    channel: Channel
    category: str
    attacker_role: str = Field(..., description="피싱범의 역할 설정(예: 은행 직원 사칭)")
    objective: str = Field(..., description="대화 목적(예: 사용자를 불안하게 만들어 앱 설치를 유도)")
    stages: list[ScenarioStage]
    opening_line: str = Field(..., description="AI가 먼저 꺼내는 첫 멘트")


Role = Literal["system", "user", "assistant"]


class ChatMessage(BaseModel):
    role: Role
    content: str

