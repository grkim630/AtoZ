import os
import threading
import random
import time
import tkinter as tk
from tkinter import messagebox
import pygame
from gtts import gTTS
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import speech_recognition as sr

# 1. API 키 및 모델 설정 (직접 입력 방식으로 통일)
API_KEY = "YOUR_OPENAI_API_KEY_HERE"
# OpenAI 클라이언트 설정 (TTS용)
client = OpenAI(api_key=API_KEY)

# LangChain ChatOpenAI 설정 (대화 생성용)
# 모델은 시연 속도를 위해 gpt-4o-mini를 권장하지만, gpt-4o를 원하시면 수정 가능합니다.
llm = ChatOpenAI(
    model="gpt-4o-mini", 
    temperature=0.8,
    openai_api_key=API_KEY
)

pygame.mixer.init()

# 2. 음성 출력 함수 (OpenAI TTS - Onyx 보이스)
def speak(text):
    if not text: return
    temp_fn = f"speech_{random.randint(1, 9999)}.mp3" # 파일명 생성
    
    try:
        pygame.mixer.music.stop()
        pygame.mixer.music.unload() # 기존 파일 연결 해제
        
        # 고퀄리티 TTS 생성 및 파일 저장
        response = client.audio.speech.create(
            model="tts-1",
            voice="onyx",
            input=text
        )
        response.stream_to_file(temp_fn)
        
        # 재생
        pygame.mixer.music.load(temp_fn)
        pygame.mixer.music.play()
        
        # 재생이 끝날 때까지 대기
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
        # [핵심] 재생 종료 후 파일 연결을 완전히 끊고 삭제
        pygame.mixer.music.unload() 
        if os.path.exists(temp_fn):
            os.remove(temp_fn)
            
    except Exception as e:
        print(f"TTS 에러: {e}")
        # 에러 발생 시에도 파일이 남아있다면 삭제 시도
        try:
            pygame.mixer.music.unload()
            if os.path.exists(temp_fn):
                os.remove(temp_fn)
        except:
            pass

# 3. 음성 인식 함수 (STT)
def listen():
    r = sr.Recognizer()
    # [개선 1] 에너지 임계값 설정 (소음이 많을 때 숫자를 높이면 작은 소음은 무시함)
    r.energy_threshold = 4000 
    r.dynamic_energy_threshold = True
    
    with sr.Microphone() as source:
        print("\n🎤 [나]: (말씀하세요...)")
        # [개선 2] 주변 소음 학습 시간을 늘려 더 정확하게 배경 소음을 제거함
        r.adjust_for_ambient_noise(source, duration=1.5) 
        
        try:
            # [개선 3] 말하기 시작 전 대기(timeout)와 말하는 도중 멈춤(phrase_time_limit)을 넉넉히 설정
            audio = r.listen(source, timeout=5, phrase_time_limit=8)
            text = r.recognize_google(audio, language='ko-KR')
            print(f"👉 인식 성공: {text}")
            return text
        except sr.WaitTimeoutError:
            print("⌛ 대기 시간 초과")
            return ""
        except sr.UnknownValueError:
            print("❓ 음성을 이해하지 못했습니다.")
            return ""
        except Exception as e:
            print(f"❌ 에러 발생: {e}")
            return ""

# 4. GUI 앱 클래스
class PhishingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Voice Phishing Simulator")
        self.root.geometry("400x700")
        self.root.configure(bg='#1c1c1c')

        # 발신자 정보 UI
        self.caller_id = tk.Label(root, text="02-1234-5678", fg="white", bg="#1c1c1c", font=("Helvetica", 25, "bold"))
        self.caller_id.pack(pady=(80, 10))
        
        self.location = tk.Label(root, text="대한민국 서울특별시", fg="#8e8e8e", bg="#1c1c1c", font=("Helvetica", 12))
        self.location.pack()

        self.status = tk.Label(root, text="전화 수신 중...", fg="#4cd964", bg="#1c1c1c", font=("Helvetica", 14))
        self.status.pack(pady=100)

        # 버튼 프레임
        self.btn_frame = tk.Frame(root, bg="#1c1c1c")
        self.btn_frame.pack(side=tk.BOTTOM, pady=80)

        self.accept_btn = tk.Button(self.btn_frame, text="응답", bg="#4cd964", fg="white", width=12, height=3, 
                                    font=("Helvetica", 12, "bold"), command=self.start_simulation)
        self.accept_btn.pack(side=tk.LEFT, padx=20)

        self.decline_btn = tk.Button(self.btn_frame, text="거절", bg="#ff3b30", fg="white", width=12, height=3, 
                                     font=("Helvetica", 12, "bold"), command=root.destroy)
        self.decline_btn.pack(side=tk.LEFT, padx=20)

    def start_simulation(self):
        self.status.config(text="통화 중...", fg="#ff3b30")
        self.accept_btn.config(state=tk.DISABLED)
        # 별도 쓰레드에서 대화 실행
        threading.Thread(target=self.run_logic, daemon=True).start()

    def run_logic(self):
        # 1. 첫 대사
        intro = "서울중앙지검 박준형 수사관입니다. 본인 성함 joon 맞으시죠?"
        print(f"AI: {intro}")
        speak(intro)

        chat_history = [f"AI: {intro}"]

        while True:
            # 2. 음성 인식 시도
            user_input = listen()
            
            if not user_input:
                print("🎤 음성 인식 실패. 직접 입력해 주세요.")
                # GUI 환경에서 input()은 터미널에서 입력받습니다.
                user_input = input("나(입력): ")

            if "그만" in user_input or "종료" in user_input:
                break

            chat_history.append(f"사용자: {user_input}")

            # 3. AI 응답 생성 (위압적인 수사관 페르소나)
            instruction = (
                "너는 지금 검찰을 사칭하는 보이스피싱범이야. "
                "매우 위압적이고 고압적으로 말해. 한 문장씩만 짧게 끊어서 말해. "
                "상대방이 의심하면 수사방해죄를 언급하며 소리를 질러."
            )
            
            try:
                response = llm.invoke(f"{instruction}\n대화기록: {chat_history}\n마지막 사용자 말: {user_input}")
                ai_msg = response.content
                
                print(f"AI: {ai_msg}")
                chat_history.append(f"AI: {ai_msg}")
                speak(ai_msg)
            except Exception as e:
                print(f"대화 생성 에러: {e}")
                break

        # 4. 종료 후 리포트 출력
        self.show_report(chat_history)

    def show_report(self, history):
        print("\n📊 분석 리포트 생성 중...")
        try:
            analysis = llm.invoke(f"다음 보이스피싱 대화에서 사용자가 개인정보를 얼마나 노출했는지 분석하고 교육적 조언을 줘: {history}")
            messagebox.showinfo("피싱 분석 리포트", analysis.content)
        except:
            messagebox.showinfo("피싱 분석 리포트", "분석 결과를 가져오지 못했습니다.")
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = PhishingApp(root)
    root.mainloop()