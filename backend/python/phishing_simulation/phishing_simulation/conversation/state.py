from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass

from pydantic import BaseModel, Field

from phishing_simulation.scenario.base import ChatMessage, Scenario


class ConversationState(BaseModel):
    session_id: str
    scenario: Scenario
    stage_index: int = 0
    history: list[ChatMessage] = Field(default_factory=list)
    created_at_ms: int = Field(default_factory=lambda: int(time.time() * 1000))
    updated_at_ms: int = Field(default_factory=lambda: int(time.time() * 1000))

    def touch(self) -> None:
        self.updated_at_ms = int(time.time() * 1000)

    def add_user(self, text: str) -> None:
        self.history.append(ChatMessage(role="user", content=text))
        self.touch()

    def add_assistant(self, text: str) -> None:
        self.history.append(ChatMessage(role="assistant", content=text))
        self.touch()


@dataclass(frozen=True)
class SessionStoreConfig:
    ttl_seconds: int


class SessionStore:
    """
    단순 인메모리 세션 저장소.
    - 프로덕션에서는 Redis/DB로 교체 권장
    - 동시성: FastAPI 단일 프로세스 내에서만 안전(멀티 워커면 세션 공유 안 됨)
    """

    def __init__(self, config: SessionStoreConfig):
        self._config = config
        self._items: dict[str, ConversationState] = {}

    def _now_ms(self) -> int:
        return int(time.time() * 1000)

    def _is_expired(self, state: ConversationState) -> bool:
        age_ms = self._now_ms() - state.updated_at_ms
        return age_ms > self._config.ttl_seconds * 1000

    def _gc(self) -> None:
        expired = [sid for sid, st in self._items.items() if self._is_expired(st)]
        for sid in expired:
            self._items.pop(sid, None)

    def create(self, scenario: Scenario, *, opening_assistant_line: str | None = None) -> ConversationState:
        self._gc()
        session_id = str(uuid.uuid4())
        st = ConversationState(session_id=session_id, scenario=scenario, stage_index=0, history=[])
        if opening_assistant_line:
            st.add_assistant(opening_assistant_line)
        self._items[session_id] = st
        return st

    def get(self, session_id: str) -> ConversationState | None:
        self._gc()
        st = self._items.get(session_id)
        if not st:
            return None
        if self._is_expired(st):
            self._items.pop(session_id, None)
            return None
        return st

    def save(self, state: ConversationState) -> None:
        self._gc()
        self._items[state.session_id] = state

    def delete(self, session_id: str) -> None:
        self._items.pop(session_id, None)


def _load_store_config() -> SessionStoreConfig:
    ttl = int(os.getenv("SIMULATION_SESSION_TTL_SECONDS", "3600"))
    ttl = max(60, ttl)  # 최소 1분
    return SessionStoreConfig(ttl_seconds=ttl)


STORE = SessionStore(_load_store_config())

