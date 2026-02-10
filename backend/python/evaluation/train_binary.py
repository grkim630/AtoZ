import argparse
import os
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from sklearn.model_selection import train_test_split
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm

from inference.model import KoBERTClassifier
from inference.tokenizer import load_tokenizer
from preprocess.text_clean import preprocess_text


DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


class TextClsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len: int):
        self.texts = list(texts)
        self.labels = list(labels)
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, idx: int) -> dict:
        text = preprocess_text(str(self.texts[idx]))
        enc = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=self.max_len,
            return_tensors="pt",
        )
        return {
            "input_ids": enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "labels": torch.tensor(int(self.labels[idx]), dtype=torch.long),
        }


def evaluate(model: torch.nn.Module, loader: DataLoader) -> dict:
    model.eval()
    correct = 0
    total = 0
    probs_pos = []
    labels_all = []

    with torch.no_grad():
        for batch in loader:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            logits = model(input_ids, attention_mask)
            probs = F.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1)

            correct += (pred == labels).sum().item()
            total += labels.size(0)

            probs_pos.extend(probs[:, 1].detach().cpu().tolist())
            labels_all.extend(labels.detach().cpu().tolist())

    acc = correct / max(1, total)
    return {
        "acc": round(float(acc), 4),
        "n": int(total),
        "mean_phishing_prob": round(float(np.mean(probs_pos)) if probs_pos else 0.0, 4),
        "pos_rate": round(float(np.mean(labels_all)) if labels_all else 0.0, 4),
    }


def train(args: argparse.Namespace) -> None:
    df = pd.read_csv(args.data_path)
    if args.text_col not in df.columns or args.label_col not in df.columns:
        raise ValueError(
            f"CSV 컬럼이 필요합니다: text_col={args.text_col}, label_col={args.label_col}. "
            f"현재 컬럼: {list(df.columns)}"
        )

    texts = df[args.text_col].astype(str)
    labels = df[args.label_col].astype(int)

    x_train, x_val, y_train, y_val = train_test_split(
        texts,
        labels,
        test_size=args.val_ratio,
        random_state=args.seed,
        shuffle=True,
        stratify=labels if labels.nunique() > 1 else None,
    )

    tokenizer = load_tokenizer()
    train_ds = TextClsDataset(x_train, y_train, tokenizer, max_len=args.max_len)
    val_ds = TextClsDataset(x_val, y_val, tokenizer, max_len=args.max_len)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=max(1, args.batch_size * 2), shuffle=False)

    model = KoBERTClassifier(num_classes=2).to(DEVICE)
    optim = AdamW(model.parameters(), lr=args.lr)

    best_acc = -1.0
    out_path = Path(args.output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        model.train()
        total_loss = 0.0

        for batch in tqdm(train_loader, desc=f"train epoch {epoch}/{args.epochs}"):
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels_b = batch["labels"].to(DEVICE)

            logits = model(input_ids, attention_mask)
            loss = F.cross_entropy(logits, labels_b)

            optim.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optim.step()

            total_loss += loss.item()

        avg_loss = total_loss / max(1, len(train_loader))
        metrics = evaluate(model, val_loader)
        print(f"[epoch {epoch}] loss={avg_loss:.4f} val={metrics}")

        if metrics["acc"] > best_acc:
            best_acc = metrics["acc"]
            torch.save(model.state_dict(), str(out_path))
            print(f"saved best weights to: {out_path} (val_acc={best_acc})")

    print("done.")


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parent
    default_output = root / "weights" / "kobert.pt"

    p = argparse.ArgumentParser(description="KoBERT binary(2-class) fine-tuning -> weights/kobert.pt 생성")
    p.add_argument("--data_path", type=str, required=True, help="CSV 경로 (예: KorCCViD_v1.3_fullcleansed.csv)")
    p.add_argument("--text_col", type=str, default="Transcript", help="텍스트 컬럼명")
    p.add_argument("--label_col", type=str, default="Label", help="라벨 컬럼명(0/1)")
    p.add_argument("--output_path", type=str, default=str(default_output), help="저장할 pt 경로")
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--batch_size", type=int, default=16)
    p.add_argument("--max_len", type=int, default=128)
    p.add_argument("--lr", type=float, default=2e-5)
    p.add_argument("--val_ratio", type=float, default=0.2)
    p.add_argument("--seed", type=int, default=42)
    return p.parse_args()


if __name__ == "__main__":
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    train(parse_args())