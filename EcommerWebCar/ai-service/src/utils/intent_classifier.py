import re

# ==============================================================================
# BỘ PHÂN LOẠI INTENT CỰC NHẸ CHẠY CỤC BỘ (LOCAL LIGHTWEIGHT INTENT CLASSIFIER)
# Mục tiêu: Chặn đứng các câu hỏi ngoài lề (Thời tiết, Ngày tháng, Toán học, AI...)
# ngay tại API Gateway để bảo vệ LLM khỏi các cuộc tấn công spam, tối ưu chi phí 100%.
# ==============================================================================

OFF_TOPIC_KEYWORDS = {
    "weather": [
        "thời tiết", "nhiệt độ", "dự báo thời tiết", "mưa không", "nắng không", 
        "trời mưa", "trời nắng", "nhiệt độ bao nhiêu", "thời tiết hôm nay", "thời tiết ngày mai"
    ],
    "datetime": [
        "hôm nay thứ mấy", "hôm nay là thứ mấy", "mấy giờ rồi", "mấy giờ", 
        "ngày bao nhiêu", "tháng mấy", "năm nay năm nào", "ngày mấy"
    ],
    "general_knowledge_tech": [
        "rag là gì", "chatbot rag là gì", "ai là gì", "trí tuệ nhân tạo là gì", 
        "deep learning là gì", "machine learning là gì", "học máy", "lập trình là gì", 
        "viết code", "python là gì", "react là gì", "java là gì"
    ],
    "general_chat": [
        "kể chuyện đi", "kể chuyện cười", "làm thơ", "thơ lục bát", "viết văn", 
        "tả con chó", "tả con mèo", "tập làm văn", "giải toán", "bài toán", 
        "tính hộ", "phép tính", "dịch hộ", "dịch sang tiếng", "dịch tiếng anh"
    ]
}

def classify_intent_local(text: str) -> tuple[bool, str]:
    """
    Bộ phân loại Intent cực nhẹ chạy cục bộ (Local Filter).
    Trả về:
        - is_off_topic (bool): True nếu là câu hỏi ngoài lề.
        - intent_category (str): Phân loại nhóm ngoài lề (weather, datetime, etc.) hoặc 'on_topic'.
    """
    if not text or not text.strip():
        return False, "empty"
    
    # Chuẩn hóa văn bản đầu vào để so khớp chính xác
    text_clean = text.lower().strip()
    
    # 1. QUY TẮC 1: Duyệt qua các tập từ khóa định nghĩa sẵn của các nhóm ngoài lề
    for category, keywords in OFF_TOPIC_KEYWORDS.items():
        for kw in keywords:
            if kw in text_clean:
                return True, category
                
    # 2. QUY TẮC 2: Sử dụng Regex để bắt nhanh các phép toán spam (ví dụ: '1 + 1 = mấy', '5 * 10')
    if re.search(r'\d+\s*[\+\-\*\/]\s*\d+', text_clean):
        return True, "math_spam"
        
    return False, "on_topic"
