# main.py
from preprocess.text_clean import preprocess_text
from inference.predictor import predict_risk

if __name__ == "__main__":
    raw_text = """
    차예은  
    이거 택배 문자 왔는데 진짜야? 반송된대...  21:03
    차예은  
    [배송안내] 고객님 택배가 주소 불명으로 보관 중입니다.  
    오늘까지 확인하지 않으면 자동 반송되며 보관료 3,000원이 발생할 수 있습니다.  
    배송지 확인: [URL]  
    문의: 010-****-6789
    눌러야 돼?  21:04
    """

    clean_text = preprocess_text(raw_text)
    result = predict_risk(clean_text)

    print("입력 텍스트:", clean_text)
    print("분석 결과:", result)
