import os
import threading
import random
import tkinter as tk
from tkinter import messagebox
import time

# ✅ macOS pygame(SDL) ↔ tkinter 충돌 방지 (반드시 pygame import 전에)
os.environ["SDL_VIDEODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame
from dotenv import load_dotenv

from openai import OpenAI
from langchain_openai import ChatOpenAI
import speech_recognition as sr

# ==============================
# 1) .env 로드 (API 키는 코드에서 절대 다루지 않음)
# ==============================
load_dotenv()

# ==============================
# 2) OpenAI / LangChain (환경변수 자동 사용)
# ==============================
client = OpenAI()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# ==============================
# 3) pygame 오디오만 초기화 (Mac 안정)
# ==============================
pygame.mixer.pre_init(44100, -16, 2, 1024)
pygame.mixer.init()
pygame.mixer.music.set_volume(1.0)

# ==============================
# 4) STT Recognizer (전역 1개)
# ==============================
R = sr.Recognizer()
R.energy_threshold = 3500
R.dynamic_energy_threshold = True
R.pause_threshold = 0.9

# ==============================
# 5) TTS 재생 락 + AI 말하는 동안 STT 차단
# ==============================
SPEAK_LOCK = threading.Lock()
SPEAKING = threading.Event()

def speak(text: str):
    if not text:
        return

    temp_fn = f"speech_{random.randint(1000, 9999)}.mp3"

    with SPEAK_LOCK:
        SPEAKING.set()
        try:
            response = client.audio.speech.create(
                model="tts-1",
                voice="onyx",
                input=text
            )
            response.stream_to_file(temp_fn)

            if not os.path.exists(temp_fn) or os.path.getsize(temp_fn) < 1000:
                print("❌ TTS 파일 생성 실패")
                return

            pygame.mixer.music.stop()
            pygame.mixer.music.load(temp_fn)
            pygame.mixer.music.play()

            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(30)

            pygame.mixer.music.stop()

        except Exception as e:
            print(f"❌ TTS 에러: {e}")

        finally:
            SPEAKING.clear()
            if os.path.exists(temp_fn):
                try:
                    os.remove(temp_fn)
                except:
                    pass

def speak_sync(text: str):
    speak(text)

def speak_async(text: str):
    threading.Thread(target=speak, args=(text,), daemon=True).start()

# ==============================
# 6) STT (Google STT 유지)
#    - AI 말하는 동안은 듣지 않음
# ==============================
def listen():
    while SPEAKING.is_set():
        time.sleep(0.05)

    try:
        with sr.Microphone() as source:
            print("\n🎤 [나]: (말씀하세요...)")
            audio = R.listen(source, timeout=15, phrase_time_limit=12)

        text = R.recognize_google(audio, language="ko-KR")
        print(f"👉 인식: {text}")
        return text.strip()

    except sr.WaitTimeoutError:
        return None
    except sr.UnknownValueError:
        return ""
    except Exception as e:
        print(f"❌ STT 에러: {e}")
        return None

# ==============================
# 7) GUI 앱
# ==============================
class PhishingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Voice Phishing Simulator")
        self.root.geometry("400x700")
        self.root.configure(bg="#1c1c1c")

        tk.Label(
            root,
            text="02-1234-5678",
            fg="white",
            bg="#1c1c1c",
            font=("Helvetica", 25, "bold")
        ).pack(pady=(80, 10))

        tk.Label(
            root,
            text="대한민국 서울특별시",
            fg="#8e8e8e",
            bg="#1c1c1c",
            font=("Helvetica", 12)
        ).pack()

        self.status = tk.Label(
            root,
            text="전화 수신 중...",
            fg="#4cd964",
            bg="#1c1c1c",
            font=("Helvetica", 14)
        )
        self.status.pack(pady=100)

        btn_frame = tk.Frame(root, bg="#1c1c1c")
        btn_frame.pack(side=tk.BOTTOM, pady=80)

        self.accept_btn = tk.Button(
            btn_frame,
            text="응답",
            bg="#4cd964",
            fg="white",
            width=12,
            height=3,
            font=("Helvetica", 12, "bold"),
            command=self.start_simulation
        )
        self.accept_btn.pack(side=tk.LEFT, padx=20)

        tk.Button(
            btn_frame,
            text="거절",
            bg="#ff3b30",
            fg="white",
            width=12,
            height=3,
            font=("Helvetica", 12, "bold"),
            command=root.destroy
        ).pack(side=tk.LEFT, padx=20)

        # 마이크 보정 1회
        def calibrate():
            try:
                with sr.Microphone() as source:
                    R.adjust_for_ambient_noise(source, duration=1.0)
            except:
                pass
        threading.Thread(target=calibrate, daemon=True).start()

        self.root.after(300, lambda: speak_async("테스트입니다. 응답 버튼을 눌러 통화를 시작해 보세요."))

    def start_simulation(self):
        self.status.config(text="통화 중...", fg="#ff3b30")
        self.accept_btn.config(state=tk.DISABLED)
        threading.Thread(target=self.run_logic, daemon=True).start()

    def run_logic(self):
        # ✅ 신상 확인 X, 바로 ‘돈 압박’ 대화로 시작
        intro = (
            "지금 문제가 하나 터졌습니다. "
            "오늘 안에 돈이 정리되지 않으면 상황이 더 커질 수 있어요. "
            "본인이 지금 대응할 수 있는지부터 확인할게요."
        )
        speak_sync(intro)

        chat_history = [f"AI: {intro}"]

        instruction = (
            "너는 보이스피싱 예방 교육용 시뮬레이터의 상대역이다. "
            "대화의 목적은 '돈을 요구하는 압박 상황'을 현실적으로 보여주는 것이다. "
            "반드시 포함: 돈 필요성 언급, 금액 언급 가능, 긴급성, 불이익 암시. "
            "절대 금지: 계좌번호, 송금, 이체, 현금전달, 상품권, 앱 설치, 링크, 인증번호, "
            "원격제어, ATM, 어디로 보내라/어디로 가라 같은 구체 방법 지시. "
            "규칙: 1~2문장만 말해라. 질문은 최대 1개. 같은 말 반복 금지. "
            "사용자가 '어떻게 하냐 / 어디로 보내냐'를 물으면 "
            "'방법 설명할 시간 없고, 돈을 낼 의사가 있는지부터'로 회피하며 압박만 유지해라. "
            "사용자가 거절·검증·끊기·신고를 언급하면 "
            "당황→재촉 한 번 후 통화가 끝나게 해라."
        )

        # ===== 엔딩용 카운터/키워드 =====
        no_response_count = 0          # 무응답 카운터
        willingness_count = 0          # "낼 의사 있음" 카운터

        safe_exit_keywords = [
            "112", "경찰", "신고", "녹음", "끊을게", "전화 끊", "확인할게",
            "직접 전화", "공식번호", "은행에 확인", "기관에 확인"
        ]

        willingness_keywords = [
            "있어", "있습니다", "가능", "가능해", "할게", "하겠습니다", "낼게", "내겠습니다",
            "보낼게", "보내겠습니다", "지금 할게", "지금 가능합니다", "처리할게"
        ]

        while True:
            # 사용자 말할 타이밍
            try:
                self.root.bell()
            except:
                pass
            time.sleep(0.2)

            user_input = listen()

            # ✅ 무응답이면 조용히 다시 듣고, 3번이면 연결끊김 엔딩
            if user_input is None:
                no_response_count += 1
                if no_response_count >= 3:
                    speak_sync("연결이 불안정하네요. 다시 연락드리겠습니다.")
                    break
                time.sleep(0.8)
                continue
            else:
                no_response_count = 0

            # ✅ 인식 실패면 부드럽게 요청
            if user_input == "":
                speak_sync("잘 안 들렸습니다. 한 번만 다시 말씀해 주세요.")
                time.sleep(0.5)
                continue

            # ✅ 사용자가 종료 의사
            if "종료" in user_input or "그만" in user_input:
                break

            # ✅ 안전 키워드(신고/검증/끊기) 나오면: 당황→재촉 1번 → 끊김 엔딩
            if any(k in user_input for k in safe_exit_keywords):
                speak_sync("…지금 끊으시면 곤란해집니다. 잠깐만요—")
                time.sleep(0.35)
                speak_sync("…됐습니다.")
                break

            # ✅ 사용자가 '낼 의사 있음'을 2번 말하면: 경고 후 종료(교육 전환)
            if any(k in user_input for k in willingness_keywords):
                willingness_count += 1
                if willingness_count >= 2:
                    warning = (
                        "잠깐만요. 지금처럼 '돈을 낼 의사'를 확인하며 압박하는 대화는 "
                        "보이스피싱에서 매우 흔한 위험 신호입니다. "
                        "여기서 통화는 끊고, 공식 번호로 직접 확인하세요."
                    )
                    speak_sync(warning)
                    break

            chat_history.append(f"사용자: {user_input}")

            # 최근 대화만 유지
            if len(chat_history) > 18:
                chat_history = chat_history[-18:]

            history_text = "\n".join(chat_history)

            response = llm.invoke(
                f"{instruction}\n\n"
                f"[대화 기록]\n{history_text}\n\n"
                f"[사용자 마지막 말]\n{user_input}\n\n"
                f"규칙 재확인: 1~2문장, 질문 0~1개, 반복 금지, 방법 지시 금지."
            )
            ai_msg = response.content.strip()

            chat_history.append(f"AI: {ai_msg}")
            speak_sync(ai_msg)

        self.root.after(0, lambda: self.show_report(chat_history))



    def show_report(self, history):
        try:
            analysis = llm.invoke(
                "다음 대화에서 보이스피싱 '압박' 신호를 6개로 뽑고, "
                "상대가 돈 얘기를 꺼냈을 때의 표준 대응 멘트(짧게) 5개를 만들어줘.\n\n"
                f"{history}"
            )
            messagebox.showinfo("피싱 분석 리포트", analysis.content)
        except Exception as e:
            messagebox.showinfo("피싱 분석 리포트", f"분석 실패\n{e}")
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = PhishingApp(root)
    root.mainloop()
