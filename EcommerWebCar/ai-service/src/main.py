import os

os.environ["CUDA_VISIBLE_DEVICES"]               = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"]               = "3"
os.environ["TF_USE_LEGACY_KERAS"]                = "0"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"]  = "1"
os.environ["TOKENIZERS_PARALLELISM"]             = "false"

import tensorflow as tf
try:
    tf.config.set_visible_devices([], 'GPU')
except Exception:
    pass

import json
import re
import ssl
import uvicorn
import numpy as np
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
import os
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from langchain_core.globals import set_llm_cache
from langchain_redis import RedisSemanticCache
from langchain_openai import ChatOpenAI
from langchain_community.chat_message_histories import RedisChatMessageHistory

from src.core.agent import get_car_agent
from src.core.rag_engine import RAGEngine
from src.core.config import FAULT_KEYWORDS
from src.utils.logger import get_logger
from src.utils.query_logger import log_customer_query
from src.utils.analysis import analyze_sentiment
from src.utils.db_utils import get_inventory, get_last_result, reset_last_result
from src.utils.card_helper import normalize_cards
from src.utils.intent_classifier import classify_intent_local
from src.services.car_classifier import identify_car_from_bytes
from src.services.image_validator import is_valid_car_image
from src.services.price_service import preprocess_image, preprocess_tabular, preprocess_text, predict_price
from src.services.damage_detector import detect_damage
from src.services.model_loader import load_all, is_ready
from src.services.vision_helpers import get_penalty, to_base64
from src.services.mazda_price_lookup import lookup_mazda_price, get_model_info

import py_eureka_client.eureka_client as eureka_client

logger           = get_logger("MAIN_SERVICE")
sentiment_logger = get_logger("SENTIMENT_ANALYSIS")

ssl._create_default_https_context = ssl._create_unverified_context
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    print("Nap thanh cong")

load_all()

vision_llm = ChatOpenAI(
    model="gpt-4o",
    api_key=os.getenv("OPEN_API_KEY"),
    temperature=0,
    cache=False,
)

async def register_eureka():
    await eureka_client.init_async(
        eureka_server="http://localhost:8761/eureka",
        app_name="ai-service",
        instance_port=8000,
        instance_host="127.0.0.1",
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    await register_eureka()
    yield

app = FastAPI(title="Chatbot Showroom Ô tô", version="2.0.0", lifespan=lifespan)


engine = RAGEngine()

try:
    set_llm_cache(RedisSemanticCache(
        redis_url=REDIS_URL,
        embeddings=engine.embeddings,
        distance_threshold=0.1,
    ))
    print("Redis semantic cache loaded")
except Exception as e:
    logger.error(e)

agent_executor = get_car_agent()
print("Agent ready")

class ChatRequest(BaseModel):
    message:    str
    session_id: str = "default_user"


class ClearHistoryRequest(BaseModel):
    session_id: str = "default_user"


def extract_faults_from_description(text: str) -> list:
    if not text:
        return []
    text = text.lower()
    detected_keys = []
    for key, patterns in FAULT_KEYWORDS.items():
        for pattern in patterns:
            if re.search(r'\b' + re.escape(pattern) + r'\b', text):
                detected_keys.append(key)
                break
    return detected_keys


@app.get("/")
def read_root():
    return {
        "status":  "online",
        "version": "2.0.0",
        "endpoints": {
            "GET  /health":           "Kiểm tra sức khỏe hệ thống",
            "GET  /car-variants":     "Danh sách xe và phiên bản",
            "POST /chat":             "Chat với AI tư vấn",
            "POST /clear-history":    "Xóa lịch sử chat",
            "POST /identify-car-pro": "Nhận diện xe từ ảnh",
            "POST /predict-price":    "Định giá xe",
        },
    }


@app.get("/health")
def health_check():
    try:
        RedisChatMessageHistory(session_id="health_check", url=REDIS_URL).clear()
        return {
            "status":       "healthy",
            "redis":        "connected (Redis Stack)",
            "agent":        "ready",
            "vision_model": "gemini-2.5-pro",
            "price_model":  "loaded" if is_ready() else "not loaded",
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    reset_last_result()

    try:
        # Gọi bộ phân loại Intent chạy local trước để chặn spam/ngoài lề, tiết kiệm chi phí tuyệt đối
        is_off_topic, category = classify_intent_local(request.message)
        if is_off_topic:
            refusal_reply = (
                "Dạ, em là trợ lý tư vấn của Showroom CarShop. Em chỉ có thể hỗ trợ "
                "anh/chị các thông tin liên quan đến các dòng xe, giá lăn bánh, dịch vụ "
                "và thủ tục mua bán tại showroom thôi ạ. Anh/chị có muốn tham khảo "
                "dòng xe nào đang có sẵn tại showroom bên em không ạ?"
            )
            # Đồng bộ lịch sử trò chuyện cục bộ vào Redis
            history = RedisChatMessageHistory(
                session_id=request.session_id,
                url=REDIS_URL,
                ttl=3600,
            )
            history.add_user_message(request.message)
            history.add_ai_message(refusal_reply)
            
            logger.info(f"[LOCAL_INTENT_CLASSIFIER] Blocked off-topic query ({category}) from session {request.session_id}")
            
            try:
                log_customer_query(
                    session_id=request.session_id,
                    query=request.message,
                    intent=category or "OFF_TOPIC",
                    sentiment="NEUTRAL",
                    is_off_topic=True
                )
            except Exception as log_err:
                logger.error(f"Error logging off-topic query: {log_err}")

            return {
                "reply":      refusal_reply,
                "session_id": request.session_id,
                "sentiment":  "NEUTRAL",
                "alert":      False,
                "cards":      [],
                "intent":     "OFF_TOPIC_BLOCKED",
            }

        history = RedisChatMessageHistory(
            session_id=request.session_id,
            url=REDIS_URL,
            ttl=3600,
        )

        sentiment = analyze_sentiment(request.message)
        sentiment_logger.info(
            f"Session:{request.session_id} | Sentiment:{sentiment} | Msg:{request.message}"
        )

        response = agent_executor.invoke({
            "input":        request.message,
            "chat_history": history.messages,
        })

        cached      = get_last_result()
        last_intent = cached.get("intent")
        last_data   = cached.get("data")
        cards       = normalize_cards(last_data, last_intent) if last_intent else []

        history.add_user_message(request.message)
        history.add_ai_message(response["output"])

        is_negative = sentiment == "NEGATIVE"
        if is_negative:
            sentiment_logger.error(
                f"ALERT: Khach hang buc xuc -- session {request.session_id}"
            )

        final_response = {
            "reply":      response["output"],
            "session_id": request.session_id,
            "sentiment":  sentiment,
            "alert":      is_negative,
            "cards":      cards,
            "intent":     last_intent,
        }
        logger.info(f"Final response for session {request.session_id} prepared.")

        try:
            log_customer_query(
                session_id=request.session_id,
                query=request.message,
                intent=last_intent or "GENERAL_QA",
                sentiment=sentiment,
                is_off_topic=False
            )
        except Exception as log_err:
            logger.error(f"Error logging customer query: {log_err}")

        return final_response

    except Exception as e:
        import traceback
        sentiment_logger.error(f"chat_endpoint error: {e}")
        sentiment_logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=503,
            content={
                "reply": (
                    "Em đang gặp sự cố kỹ thuật tạm thời. "
                    "Anh/chị vui lòng thử lại sau hoặc liên hệ trực tiếp showroom ạ."
                ),
                "session_id": request.session_id,
                "sentiment":  "NEUTRAL",
                "alert":      False,
                "cards":      [],
                "intent":     None,
                "error":      True,
                "detail":     str(e),
            },
        )


@app.post("/clear-history")
def clear_history_endpoint(body: ClearHistoryRequest):
    try:
        RedisChatMessageHistory(
            session_id=body.session_id,
            url=REDIS_URL,
            ttl=3600,
        ).clear()
        return {"ok": True, "session_id": body.session_id}
    except Exception as e:
        logger.error(f"clear_history error: {e}")
        return JSONResponse(
            status_code=503,
            content={"ok": False, "session_id": body.session_id, "detail": str(e)},
        )


@app.post("/identify-car-pro")
async def identify_car_pro(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        car_info    = identify_car_from_bytes(image_bytes)

        brand   = car_info.get("brand", "")
        model   = car_info.get("model", "")
        version = car_info.get("version", "")

        if brand == "Unknown" and model == "Unknown":
            return {"success": False, "message": "Không nhận diện được xe trong ảnh.", "data": []}

        filtered_cars = []

        if brand and model:
            filtered_cars = get_inventory(car_name=model, branch_name=brand).get("data", [])

        if not filtered_cars and model:
            filtered_cars = get_inventory(car_name=model).get("data", [])

        if not filtered_cars and brand:
            filtered_cars = get_inventory(branch_name=brand).get("data", [])

        if filtered_cars and version:
            v_lower = version.lower()
            exact = [
                c for c in filtered_cars
                if v_lower in (c.get("trim_level") or "").lower()
                or v_lower in (c.get("car_name") or "").lower()
            ]
            if exact:
                filtered_cars = exact

        return {
            "success":     True,
            "ai_detected": car_info,
            "total_found": len(filtered_cars),
            "data":        filtered_cars,
        }

    except Exception as e:
        logger.error(f"Error identify_car_pro: {e}")
        import traceback; traceback.print_exc()
        return {"success": False, "message": "Lỗi hệ thống.", "data": []}




@app.post("/predict-price")
async def predict_price_endpoint(
    brand_name: Optional[str] = Form("Mazda"),
    model_name: str = Form(...),
    trim_name: str = Form(...),
    year: int = Form(...),
    odo: int = Form(...),
    fuel: str = Form(...),
    origin: Optional[str] = Form("Việt Nam"),
    owner_count: Optional[int] = Form(1),
    service_history: Optional[str] = Form("true"),
    description: Optional[str] = Form(""),
    body_type: Optional[str] = Form("SUV"),
    color: Optional[str] = Form("Trắng"),
    gearbox: Optional[str] = Form("Tự động"),
    seats: Optional[int] = Form(5),
    engine_capacity: Optional[float] = Form(2.0),
    drivetrain: Optional[str] = Form("FWD"),
    airbags: Optional[int] = Form(6),
    files: List[UploadFile] = File(...),
):
    logger.info(f"is_ready() = {is_ready()}")
    if not is_ready():
        return {"success": False, "error": "Model chưa sẵn sàng."}

    if not files or len(files) == 0:
        return {"success": False, "error": "Cần ít nhất 1 ảnh."}

    logger.info("Reading images...")
    img_list = []
    for file in files:
        file_bytes = await file.read()
        _, img_in = preprocess_image(file_bytes)
        if img_in is not None:
            img_list.append(img_in)
            
    if not img_list:
        logger.warning("No valid images found.")
        return {"success": False, "error": "Không đọc được ảnh nào."}
        
    img_in_batch = np.vstack(img_list)
    logger.info(f"img_in_batch shape: {img_in_batch.shape}")

    try:
        logger.info("Preprocessing tabular data...")
        meta_in, full_name = preprocess_tabular(
            brand_name=brand_name,
            model_name=model_name,
            trim_name=trim_name,
            year=year,
            odo=odo,
            fuel=fuel,
            body_type=body_type,
            color=color,
            gearbox=gearbox,
            origin=origin,
            owner_count=owner_count,
            seats=seats,
            engine_capacity=engine_capacity,
            drivetrain=drivetrain,
            airbags=airbags
        )

        service_history_bool = str(service_history).lower() in ("true", "1", "yes")

        logger.info("Preprocessing text data...")
        text_in = preprocess_text(full_name, year, origin, owner_count, service_history_bool, description)

        logger.info("Calling predict_price one by one...")
        preds = []
        for i in range(len(img_list)):
            img = img_in_batch[i:i+1] # shape (1, 224, 224, 3)
            p = predict_price(img, meta_in, text_in)
            preds.append(p)
            logger.info(f"Image {i+1} prediction: {p}")
            
        raw_price_ai = float(np.mean(preds))
        
        # Hệ số điều chỉnh thị trường: 1.0 (Không cộng thêm biên độ thương lượng)
        market_multiplier = 1.0 
        raw_price = round(raw_price_ai * market_multiplier, 2)
        
        logger.info(f"AI raw: {raw_price_ai:.2f}, Final (with 1.0 buffer): {raw_price}")

        _, _ = lookup_mazda_price(model_name, year, trim_name)
        model_info = get_model_info(model_name, year)
        ref_note = ""
        # ──────────────────────────────────────────────────────────────────────

        total_penalty  = 0.0
        deduction_list = []
        
        desc_lower = description.lower()
        if any(kw in desc_lower for kw in ["xe cty", "công ty", "taxi", "dịch vụ", "kinh doanh"]):
            penalty = round(raw_price * 0.15, 2)
            total_penalty += penalty
            deduction_list.append({
                "label": "Lịch sử dịch vụ/công ty (Hao mòn cao)",
                "amount": penalty
            })
        
        final_price = round(raw_price - total_penalty, 2)

        try:
            penalty_info = ""
            if deduction_list:
                penalty_info = "LƯU Ý: Hệ thống đã áp dụng các khoản khấu trừ sau:\n"
                for d in deduction_list:
                    penalty_info += f"- {d['label']}: giảm {d['amount']} triệu VNĐ\n"

            prompt = (
                f"Bạn là chuyên gia định giá ô tô cũ. Hãy viết một đoạn phân tích (khoảng 4-5 câu) "
                f"để giải thích mức giá dự đoán của chiếc xe {brand_name} {model_name} {trim_name} đời {year}.\n\n"
                f"THÔNG TIN XE (Bắt buộc phải tuân thủ chính xác, không tự bịa thêm hay thay đổi):\n"
                f"- ODO (số km đã đi): {odo} km\n"
                f"- Xuất xứ: {origin}\n"
                f"- Hộp số: {gearbox}\n"
                f"- Màu sắc: {color}\n"
                f"- Lịch sử bảo dưỡng: {'Đầy đủ hãng' if service_history_bool else 'Bảo dưỡng ngoài'}\n"
                f"- Số đời chủ: {owner_count}\n"
                f"- Mô tả từ người bán: {description}\n\n"
                f"ĐÁNH GIÁ GIÁ TRỊ (Bắt buộc phải sử dụng đúng các con số này, không làm tròn hay thay đổi):\n"
                f"- Giá trị gốc (dựa trên thị trường): {raw_price} triệu VNĐ.\n"
                f"{penalty_info}"
                f"- MỨC GIÁ DỰ KIẾN CUỐI CÙNG (sau khi khấu trừ): {final_price} triệu VNĐ.\n\n"
                f"YÊU CẦU:\n"
                f"1. Phân tích chi tiết vì sao có mức giá {final_price} triệu VNĐ này.\n"
                f"2. Nếu có các khoản bị khấu trừ, BẮT BUỘC phải giải thích rõ ràng tại sao yếu tố đó làm giảm giá.\n"
                f"3. TUYỆT ĐỐI KHÔNG ĐƯỢC dự đoán một mức giá khác, phải khẳng định giá cuối cùng là {final_price} triệu VNĐ.\n"
                f"4. TUYỆT ĐỐI KHÔNG ĐƯỢC sai lệch các thông số xe như ODO, số đời chủ, lịch sử bảo dưỡng đã cung cấp.\n"
                f"5. Giọng văn khách quan, thuyết phục và chuyên nghiệp."
            )
            llm_response = await vision_llm.ainvoke(prompt, config={"cache": False})
            ai_explanation = llm_response.content
        except Exception as e:
            logger.error(f"Error generating GPT-4 explanation: {e}")
            ai_explanation = f"Dựa trên dữ liệu thị trường và tình trạng xe, mô hình AI dự đoán mẫu xe {model_name} {year} có giá trị thực tế khoảng {final_price} triệu VNĐ."

        return {
            "success": True,
            "data": {
                "summary": {
                    "raw_price":     raw_price,
                    "total_penalty": round(total_penalty, 2),
                    "final_price":   final_price,
                    "explanation":   ai_explanation,
                    "ref_note":      ref_note,
                    "model_info":    model_info,
                },
                "deductions":       deduction_list,
            },
        }

    except Exception as e:
        logger.error(f"predict_price_endpoint: {e}", exc_info=True)
        return {"success": False, "error": f"Lỗi xử lý nội bộ: {e}"}

@app.get("/car-hierarchy")
async def get_car_hierarchy():
    """
    Returns the car hierarchy (Brand -> Models -> Trims) extracted from the dataset
    to populate the dependent dropdowns on the frontend.
    """
    try:
        # Resolve the absolute path to car_hierarchy.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        hierarchy_path = os.path.join(project_root, "car_hierarchy.json")
        
        with open(hierarchy_path, "r", encoding="utf-8") as f:
            hierarchy_data = json.load(f)
        return {"success": True, "data": hierarchy_data}
    except Exception as e:
        logger.error(f"Error loading car hierarchy: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")