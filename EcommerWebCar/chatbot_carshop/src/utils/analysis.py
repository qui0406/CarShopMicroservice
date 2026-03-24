from langchain_groq import ChatGroq
import os


def analyze_sentiment(text: str):
    """Phân tích cảm xúc khách hàng: TÍCH CỰC, TIÊU CỰC, TRUNG LẬP"""
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)
    prompt = f"""Phân tích cảm xúc của câu nói sau bằng tiếng Việt. 
    Chỉ trả ra 1 từ duy nhất: 'POSITIVE', 'NEGATIVE', hoặc 'NEUTRAL'.
    Câu nói: "{text}" """

    response = llm.invoke(prompt)
    return response.content.strip().upper()