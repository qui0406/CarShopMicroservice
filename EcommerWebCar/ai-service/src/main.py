import os

os.environ["TF_USE_LEGACY_KERAS"]               = "0"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"]  = "1"
os.environ["TOKENIZERS_PARALLELISM"]             = "false"

import re
import ssl
import uvicorn

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
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.agent import get_car_agent
from src.core.rag_engine import RAGEngine
from src.core.config import FAULT_KEYWORDS
from src.utils.logger import get_logger
from src.utils.analysis import analyze_sentiment
from src.utils.db_utils import get_inventory, get_last_result, reset_last_result
from src.utils.card_helper import normalize_cards
from src.services.car_classifier import identify_car_from_bytes
from src.services.image_validator import is_valid_car_image
from src.services.price_service import preprocess_image, preprocess_tabular, preprocess_text, predict_price
from src.services.damage_detector import detect_damage
from src.services.model_loader import load_all, is_ready
from src.services.vision_helpers import get_penalty, to_base64

import py_eureka_client.eureka_client as eureka_client

logger           = get_logger("MAIN_SERVICE")
sentiment_logger = get_logger("SENTIMENT_ANALYSIS")

ssl._create_default_https_context = ssl._create_unverified_context
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    print("Nap thanh cong")

load_all()

vision_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0,
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

    first_bytes = await files[0].read()
    temp_path   = f"_temp_{files[0].filename}"
    with open(temp_path, "wb") as f:
        f.write(first_bytes)

    try:
        is_car, label, conf = is_valid_car_image(temp_path)
        if not is_car:
            return {"success": False, "error": "Ảnh không phải xe hơi hoặc quá mờ."}

        img_bgr_main, img_in = preprocess_image(first_bytes)
        if img_in is None:
            return {"success": False, "error": "Không đọc được ảnh."}

        meta_in, full_name = preprocess_tabular(
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

        text_in   = preprocess_text(full_name, year, origin, owner_count, service_history_bool, description)
        raw_price = round(predict_price(img_in, meta_in, text_in), 2)

        declared_keys  = extract_faults_from_description(description)
        processed_keys = set()
        total_penalty  = 0.0
        deduction_list = []
        processed_images = []

        for key in declared_keys:
            if key in processed_keys:
                continue
            processed_keys.add(key)
            amt = get_penalty(key)
            total_penalty += amt
            deduction_list.append({
                "category": "DECLARED",
                "label":    f"Người dùng khai báo: {key}",
                "key":      key,
                "amount":   amt,
                "source":   "description",
            })

        # await files[0].seek(0)
        # for f in files:
        #     content = await f.read()
        #     if not content:
        #         continue
        #
        #     img_bgr, _ = preprocess_image(content)
        #     if img_bgr is None:
        #         continue
        #
        #     annotated, damages = detect_damage(img_bgr)
        #     processed_images.append(to_base64(annotated))
        #
        #     for d in damages:
        #         key = d["item_key"]
        #         if key in processed_keys:
        #             continue
        #         processed_keys.add(key)
        #         amt = get_penalty(key)
        #         total_penalty += amt
        #         deduction_list.append({
        #             "category": "EXTERIOR_AI",
        #             "label":    f"{d['label']} ",
        #             "key":      key,
        #             "amount":   amt,
        #             "file":     f.filename,
        #         })

        std_odo = max(1, datetime.now().year - year) * 15_000
        over_km = max(0, (odo - std_odo) // 1_000)
        if over_km > 0:
            p_odo = round(get_penalty("ODO_01") * over_km, 2)
            total_penalty += p_odo
            deduction_list.append({
                "category": "USAGE",
                "label":    f"Vượt ODO {over_km}k km so với chuẩn {std_odo // 1000}k km",
                "key":      "ODO_01",
                "amount":   p_odo,
            })

        if owner_count >= 2:
            p = get_penalty("HIS_02")
            total_penalty += p
            deduction_list.append({
                "category": "HISTORY",
                "label":    f"Qua {owner_count} đời chủ (từ đời chủ thứ 2)",
                "key":      "HIS_02",
                "amount":   p,
            })

        if not service_history_bool:
            mp = get_penalty("HIS_01")
            total_penalty += mp
            deduction_list.append({
                "category": "HISTORY",
                "label":    "Không có lịch sử bảo dưỡng chính hãng",
                "key":      "HIS_01",
                "amount":   mp,
            })

        final_price = max(0.0, round(raw_price - total_penalty, 2))

        return {
            "success": True,
            "data": {
                "summary": {
                    "raw_price":     raw_price,
                    "total_penalty": round(total_penalty, 2),
                    "final_price":   final_price,
                },
                "deductions":       deduction_list,
                "processed_images": processed_images,
            },
        }

    except Exception as e:
        logger.error(f"predict_price_endpoint: {e}")
        return {"success": False, "error": "Lỗi xử lý nội bộ."}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="penalty")