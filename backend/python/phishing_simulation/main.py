import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from phishing_simulation.api.message import router as message_router
from phishing_simulation.api.phone import router as phone_router


load_dotenv()


def _parse_cors_origins(raw: str | None) -> list[str]:
    if not raw:
        return ["*"]
    raw = raw.strip()
    if raw == "*":
        return ["*"]
    return [v.strip() for v in raw.split(",") if v.strip()]


app = FastAPI(
    title="phishing_simulation",
    version="0.1.0",
    description="Scenario-based phishing experience simulator (phone/message).",
)

origins = _parse_cors_origins(os.getenv("CORS_ORIGINS"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(phone_router)
app.include_router(message_router)


@app.get("/health")
def health():
    return {"ok": True}

