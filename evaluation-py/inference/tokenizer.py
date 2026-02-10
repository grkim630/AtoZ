# inference/tokenizer.py
from transformers import BertTokenizer

def load_tokenizer():
    tokenizer = BertTokenizer.from_pretrained(
        "skt/kobert-base-v1"
    )
    return tokenizer
