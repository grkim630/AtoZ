# KoBERT 기반 보이스피싱 텍스트 분류 (2클래스)

한국어 텍스트를 입력하면 **피싱(phishing) / 정상(normal)** 을 분류하고, **피싱 확률(`risk_score`)** 을 반환합니다.

---

## 폴더/파일 구성

- `main.py`
  - 샘플 텍스트를 전처리한 뒤 `predict_risk()`로 추론하고 출력합니다.
- `preprocess/`
  - `text_clean.py`: 간단한 텍스트 전처리(줄바꿈 제거, 공백 정규화).
- `inference/`
  - `tokenizer.py`: `skt/kobert-base-v1` 토크나이저 로드
  - `model.py`: `KoBERTClassifier` (KoBERT + Linear 분류 헤드)
  - `predictor.py`: 가중치(`weights/kobert.pt`) 로드 후 `predict_risk(text)` 제공
- `train_binary.py`
  - CSV 데이터로 KoBERT 2클래스 파인튜닝 후 `weights/kobert.pt`를 생성합니다.
- `weights/`
  - `kobert.pt`: 학습(파인튜닝)된 분류기 가중치 파일
- `KoBERT/`
  - `KorCCViD_v1.3_fullcleansed.csv`: 예시 데이터셋(CSV)
  - `Korean_Text_classification_with_KoBERT.ipynb`: 참고용 노트북(원본 레포 기반)
- `requirements.txt`
  - 실행/학습에 필요한 패키지 목록

---

## 설치 (Windows / PowerShell)

아래 명령은 **그대로** 실행하면 됩니다.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\.venv\Scripts\python.exe -m pip install --only-binary=:all: --upgrade "pandas>=2.2"
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 참고(자주 필요한 추가 설치)
- `moviepy`, `pydub` 사용 시: 시스템에 **FFmpeg**가 필요할 수 있습니다.
- `graphviz` 시각화 사용 시: 파이썬 패키지(`pydot`, `graphviz`) 외에 시스템 **Graphviz** 설치가 필요할 수 있습니다.

---

## 데이터 준비 (학습용 CSV)

`train_binary.py`는 기본적으로 아래 컬럼명을 기대합니다.
- 텍스트 컬럼: `Transcript`
- 라벨 컬럼: `Label` (0/1)

예시 데이터가 `KoBERT/KorCCViD_v1.3_fullcleansed.csv`로 포함되어 있습니다.

---

## 학습(파인튜닝) → `weights/kobert.pt` 생성

아래 명령을 실행하면 best 모델이 `weights/kobert.pt`로 저장됩니다.

```powershell
.\.venv\Scripts\python.exe .\train_binary.py --data_path ".\KoBERT\KorCCViD_v1.3_fullcleansed.csv"
```

옵션(필요할 때만):
- 컬럼명이 다르면 `--text_col`, `--label_col`로 지정
- 학습 설정 변경: `--epochs`, `--batch_size`, `--max_len`, `--lr`

---

## 추론(분석) 실행

### 1) `main.py` 실행(샘플 텍스트로 테스트)

```powershell
.\.venv\Scripts\python.exe .\main.py
```

출력 예시:
- `분석 결과: {'label': 'phishing' 또는 'normal', 'risk_score': 0.xxx}`

### 2) 코드에서 직접 호출

```python
from inference.predictor import predict_risk
from preprocess.text_clean import preprocess_text

text = preprocess_text("검찰청입니다. 계좌가 범죄에 연루되어...")
print(predict_risk(text))
```

---

## API 서버 실행(FastAPI) — 다른 프로젝트에서 호출용

이 프로젝트는 `api.py`를 통해 **HTTP 추론 API**를 제공합니다.

### API 서버 실행

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8010
```

### API 사용 예시

- Health:

```powershell
curl http://127.0.0.1:8010/health
```

- Evaluate:

```powershell
curl -X POST http://127.0.0.1:8010/evaluate -H "Content-Type: application/json" -d "{\"text\":\"검찰청입니다. 계좌가 범죄에 연루되어...\",\"already_clean\":false}"
```

응답 예시(형태):
- `{"clean_text":"...", "label":"phishing|normal", "risk_score":0.xxx}`

---

## `extraction/src` 연동 방법(선택)

`extraction`은 `EVALUATION_API_URL`이 설정되어 있으면, clean text를 이 프로젝트의 `/evaluate`로 보내서
`evalLabel`, `evalRiskScore`를 결과에 합쳐줍니다.

1) `evaluation`에서 API 서버를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8010
```

2) `extraction/.env`에 아래를 추가합니다.

```env
EVALUATION_API_URL=http://127.0.0.1:8010
```

3) `extraction`을 실행하면, 파이프라인 중간에 모델 추론 결과가 자동으로 합쳐집니다.

---

## 동작 원리(요약)

1. `preprocess_text()`로 문자열 정리
2. `BertTokenizer.from_pretrained("skt/kobert-base-v1")`로 토크나이징
3. `KoBERTClassifier`로 logits 계산 → softmax
4. 피싱 확률(클래스 1)을 `risk_score`로 반환하고, 0.5 기준으로 `label` 결정

---

## 주의사항

- **인터넷 필요(최초 1회)**: `transformers`가 `skt/kobert-base-v1` 모델/토크나이저를 처음 실행 시 다운로드합니다(이후 캐시 사용).
- **가중치 파일 필수**: `weights/kobert.pt`가 없거나 0바이트면 `predict_risk()`가 에러를 냅니다. 먼저 학습을 수행하세요.