import numpy as np
import os
import base64
import re
import io
import json
import logging
import cv2
from PIL import Image
from groq import Groq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# _DAMAGE_PROMPT = """Bạn là chuyên gia thẩm định ngoại thất xe hơi.
# Hãy quan sát kỹ hình ảnh và phát hiện các vết trầy xước (scratches), móp méo (dents) hoặc hư hại ngoại thất khác.
# Trả về DUY NHẤT 1 chuỗi JSON theo cấu trúc sau:
# {
#   "damages": [
#     {
#       "item_key": "Mã lỗi (Chỉ chọn 1 trong: EXT_01, EXT_02, EXT_03, EXT_04)",
#       "label": "Tên lỗi tiếng Việt",
#       "confidence": 0.95
#     }
#   ]
# }
#
# Quy ước mã lỗi:
# - EXT_01: Trầy xước nhẹ (vết xước dăm, xước mờ)
# - EXT_02: Trầy xước sâu (xước vào lớp sơn trong, xước lớn, tróc sơn)
# - EXT_03: Móp méo thân vỏ (biến dạng bề mặt, lõm)
# - EXT_04: Nứt/vỡ đèn hoặc kính
#
# Nếu không thấy bất kỳ lỗi nào, trả về: {"damages": []}
# """

def detect_damage(image_bgr: np.ndarray) -> tuple[np.ndarray, list[dict]]:
    damages = []
    
    if image_bgr is None:
        return image_bgr, damages

    try:
        img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        
        pil_img.thumbnail((800, 800))
        
        buffer = io.BytesIO()
        pil_img.save(buffer, format="JPEG", quality=80)
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        if not _GROQ_API_KEY:
            logger.warning("GROQ_API_KEY missing. Skipping AI damage detection.")
            return image_bgr, damages

        client = Groq(api_key=_GROQ_API_KEY)
        
        resp = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct", # Giống như car_classifier.py
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": _DAMAGE_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_str}"}},
                ],
            }],
            temperature=0.0,
        )
        
        raw_text = resp.choices[0].message.content.strip()
        logger.info(f"AI Damage Result: {raw_text}")

        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            result_data = json.loads(match.group(0))
            raw_damages = result_data.get("damages", [])
            
            for d in raw_damages:
                key = d.get("item_key", "EXT_01")
                if key not in ["EXT_01", "EXT_02", "EXT_03", "EXT_04"]:
                    key = "EXT_01"
                
                damages.append({
                    "item_key": key,
                    "label":    d.get("label", "Lỗ ngoại thất"),
                    "confidence": d.get("confidence", 0.0)
                })

    except Exception as e:
        logger.error(f"Lỗi khi nhận diện hư hại qua AI: {e}")

    return image_bgr, damages
