import torch
import torch.nn.functional as F
from pathlib import Path
from inference.model import KoBERTClassifier
from inference.tokenizer import load_tokenizer

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_WEIGHTS_PATH = _ROOT / "weights" / "kobert.pt"

_MODEL = None
_TOKENIZER = None
_WEIGHTS_LOADED_FROM: Path | None = None


def _load_model_and_tokenizer(weights_path: Path = _DEFAULT_WEIGHTS_PATH):
    tokenizer = load_tokenizer()

    if not weights_path.exists() or weights_path.stat().st_size == 0:
        raise FileNotFoundError(
            f"가중치 파일이 없거나 비어 있습니다: {weights_path}\n"
            f"먼저 학습을 돌려 weights를 생성하세요. 예: python train_binary.py --data_path <csv>"
        )

    model = KoBERTClassifier()
    model.load_state_dict(torch.load(str(weights_path), map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model, tokenizer


def predict_risk(text: str) -> dict:
    global _MODEL, _TOKENIZER, _WEIGHTS_LOADED_FROM
    if _MODEL is None or _TOKENIZER is None:
        _MODEL, _TOKENIZER = _load_model_and_tokenizer()
        _WEIGHTS_LOADED_FROM = _DEFAULT_WEIGHTS_PATH

    model, tokenizer = _MODEL, _TOKENIZER
    encoded = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )

    input_ids = encoded["input_ids"].to(DEVICE)
    attention_mask = encoded["attention_mask"].to(DEVICE)

    with torch.no_grad():
        logits = model(input_ids, attention_mask)
        probs = F.softmax(logits, dim=1)

    phishing_prob = probs[0][1].item()

    return {
        "label": "phishing" if phishing_prob >= 0.5 else "normal",
        "risk_score": round(phishing_prob, 3)
    }
