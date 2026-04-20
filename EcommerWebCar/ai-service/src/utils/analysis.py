import os
from groq import Groq

def analyze_sentiment(text: str) -> str:
    if not text or not text.strip():
        return "NEUTRAL"

    text_lower = text.lower()

    negative_keywords = [
        "bực", "tức", "tệ", "kém", "chán", "thất vọng", "tồi", "dở",
        "chờ mãi", "không ai", "quá lâu", "phục vụ tệ", "lừa", "lừa đảo",
        "không hài lòng", "khiếu nại", "bức xúc", "quá tệ", "quá tồi",
        "giận", "phẫn nộ", "thất vọng", "không ổn", "không được",
        "mãi không", "đợi mãi", "sao chậm", "sao lâu",
    ]

    positive_keywords = [
        "cảm ơn", "tuyệt", "tốt quá", "hay quá", "thích", "ưng",
        "hài lòng", "xuất sắc", "chuyên nghiệp", "nhiệt tình",
        "tốt lắm", "ok lắm", "oke", "rất tốt", "rất hay",
        "tuyệt vời", "hoàn hảo", "ấn tượng", "hài lòng lắm",
    ]

    has_negative = any(kw in text_lower for kw in negative_keywords)
    has_positive = any(kw in text_lower for kw in positive_keywords)

    if has_negative and not has_positive:
        return "NEGATIVE"
    if has_positive and not has_negative:
        return "POSITIVE"

    try:
        return _llm_sentiment(text)
    except Exception:
        return "NEUTRAL"


def _llm_sentiment(text: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "Classify the sentiment of the following Vietnamese text. "
                    "Reply with EXACTLY one word — nothing else: "
                    "POSITIVE, NEGATIVE, or NEUTRAL."
                )
            },
            {"role": "user", "content": text[:300]}
        ],
        max_tokens=5,
        temperature=0,
    )

    # ✅ Guard None trước khi gọi .strip()
    content = response.choices[0].message.content
    if not content:
        return "NEUTRAL"

    raw = content.strip().upper()

    for label in ("POSITIVE", "NEGATIVE", "NEUTRAL"):
        if label in raw:
            return label

    return "NEUTRAL"

