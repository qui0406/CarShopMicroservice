import os
import base64
from openai import OpenAI
import re
import io
from PIL import Image
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_OPENAI_API_KEY = os.getenv("OPEN_API_KEY")

_IDENTIFY_PROMPT = """Bạn là hệ thống nhận diện xe ô tô chuyên nghiệp.
Nhìn vào ảnh, hãy phân tích và TRẢ VỀ DUY NHẤT 1 CHUỖI JSON. Không giải thích thêm.

Cấu trúc JSON bắt buộc:
{
    "brand": "Tên hãng xe (VD: Mazda, Toyota, Mercedes-Benz). Nếu không rõ để rỗng",
    "model": "Tên dòng xe cốt lõi (VD: CX-5, Vios, GLC). Nếu không rõ để rỗng",
    "version": "Phiên bản/Loại (VD: Premium, 2.0 AT, Luxury). Nếu không rõ để rỗng"
}

Nếu hoàn toàn không phải xe ô tô, trả về: {"brand": "Unknown", "model": "Unknown", "version": "Unknown"}
"""


def identify_car_from_bytes(image_bytes: bytes) -> str:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB': img = img.convert('RGB')
        img.thumbnail((1024, 1024))
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        client = OpenAI(api_key=_OPENAI_API_KEY)

        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": _IDENTIFY_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_str}"}},
                ],
            }],
            temperature=0.0,
        )
        raw_text = resp.choices[0].message.content.strip()

        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(raw_text)

    except Exception as e:
        logger.error(e)
        return "Unknown"
