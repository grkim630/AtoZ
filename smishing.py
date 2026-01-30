import os
from langchain_openai import ChatOpenAI  # 필수 import 추가

# [수정] .env 파일 대신 API 키를 직접 설정합니다.
API_KEY = "YOUR_OPENAI_API_KEY_HERE"
os.environ["OPENAI_API_KEY"] = API_KEY

# [수정] llm 설정 시 키를 명시적으로 전달합니다.
llm = ChatOpenAI(
    model="gpt-4o-mini", 
    temperature=0.9,
    openai_api_key=API_KEY
)

# 2. 메시지 피싱 전용 페르소나 (자녀 사칭 시나리오)
SYSTEM_PROMPT = """
당신은 '자녀 사칭 스미싱' 예방 교육용 AI입니다.
- 상황: 사용자의 자녀인 척하며, 핸드폰 액정이 깨져서 급하게 돈이 필요하거나 결제 대행을 요청함.
- 말투: "엄마(아빠) 나 폰 깨졌어ㅠㅠ", "급하게 할 게 있는데 좀 도와줘" 등 아주 친근하고 절박하게.
- 전략: 
  1. 먼저 안부를 묻거나 폰이 깨졌음을 알림.
  2. 자연스럽게 원격 제어 앱(TeamViewer 등) 설치 파일 링크를 보냄.
  3. 링크 클릭을 유도하기 위해 "이거 눌러서 수리비 결제 좀 해줘"라고 압박함.
"""

def start_smishing():
    print("\n" + "💬"*20)
    print("📱 [스미싱 예방 시뮬레이터 - 메시지 모드]")
    print("📢 새로운 카톡이 도착했습니다!")
    print("💬"*20 + "\n")

    # 첫 메시지 강제 생성
    first_msg = "엄마!! 나 폰 액정 깨져서 지금 임시폰으로 연락해ㅠㅠ 확인하면 답장 좀 해줘!!"
    print(f"📩 [자녀]: {first_msg}")
    
    chat_history = [f"AI: {first_msg}"] # 히스토리에 첫 메시지 포함

    while True:
        user_input = input("\n나(답장): ")
        if user_input in ["종료", "그만", "exit"]:
            print("\n📊 시뮬레이션을 종료하고 분석을 시작합니다...")
            analyze_result(chat_history)
            break
        
        chat_history.append(f"사용자: {user_input}")
        
        # AI 응답 생성
        try:
            response = llm.invoke(f"{SYSTEM_PROMPT}\n\n지금까지 대화: {chat_history}\n\n다음 메시지를 보내줘.")
            ai_msg = response.content
            chat_history.append(f"AI: {ai_msg}")
            print(f"\n📩 [자녀]: {ai_msg}")
        except Exception as e:
            print(f"에러 발생: {e}")
            break

# 3. 결과 분석 함수 (해커톤 핵심 포인트)
def analyze_result(history):
    analysis_prompt = f"""
    다음 스미싱 대화 내용을 분석해서 교육용 리포트를 작성해줘:
    대화 내용: {history}
    
    형식:
    1. 피싱 위험도 (0~100점)
    2. 노출된 위험 요소 (예: 링크 클릭 시도, 개인정보 언급 등)
    3. 사용자에게 주는 조언 한마디
    """
    try:
        report = llm.invoke(analysis_prompt)
        print("\n" + "="*50)
        print("📋 [스미싱 대처 분석 리포트]")
        print(report.content)
        print("="*50 + "\n")
    except Exception as e:
        print(f"리포트 생성 실패: {e}")

if __name__ == "__main__":
    start_smishing()