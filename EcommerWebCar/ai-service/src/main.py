import os

os.environ["TF_USE_LEGACY_KERAS"]              = "0"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"]            = "false"

import ssl
import uvicorn
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_core.globals import set_llm_cache
from langchain_redis import RedisSemanticCache
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.agent import get_car_agent
from src.core.rag_engine import RAGEngine
from src.utils.logger import get_logger
from src.utils.analysis import analyze_sentiment
from src.services.car_classifier import identify_car_from_bytes
from src.utils.db_utils import get_inventory
from src.services.model_loader import load_all, is_ready
from src.utils.db_utils import get_last_result, reset_last_result
from src.utils.card_helper import normalize_cards

import py_eureka_client.eureka_client as eureka_client

async def register_eureka():
    await eureka_client.init_async(
        eureka_server="http://localhost:8761/eureka",
        app_name="ai-service",
        instance_port=8000
    )


from fastapi import APIRouter
router = APIRouter(prefix="/ai")


logger           = get_logger("MAIN_SERVICE")
sentiment_logger = get_logger("SENTIMENT_ANALYSIS")

ssl._create_default_https_context = ssl._create_unverified_context
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

success= load_all

vision_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

app = FastAPI(title="Chatbot Showroom Ô tô", version="2.0.0")

engine = RAGEngine()

try:
    set_llm_cache(RedisSemanticCache(
        redis_url=REDIS_URL,
        embeddings=engine.embeddings,
        distance_threshold=0.1
    ))
    print("Redis sematic cache loaded")
except Exception as e:
    logger.error(e)

agent_executor = get_car_agent()
print("Agent ready")

class ChatRequest(BaseModel):
    message:    str
    session_id: str = "default_user"


@app.on_event("startup")
async def startup_event():
    await register_eureka()



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
        }
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
            "price_model":  "loaded" if is_ready else "not loaded",
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}




@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Reset cache truoc moi request
    reset_last_result()

    try:
        history = RedisChatMessageHistory(
            session_id=request.session_id,
            url=REDIS_URL,
            ttl=3600
        )

        sentiment = analyze_sentiment(request.message)

        sentiment_logger.info(
            f"Session:{request.session_id} | Sentiment:{sentiment} | Msg:{request.message}"
        )

        response = agent_executor.invoke({
            "input": request.message,
            "chat_history": history.messages
        })

        cached = get_last_result()
        last_intent = cached.get("intent")
        last_data = cached.get("data")
        cards = normalize_cards(last_data, last_intent) if last_intent else []

        history.add_user_message(request.message)
        history.add_ai_message(response["output"])

        is_negative = sentiment == "NEGATIVE"
        if is_negative:
            sentiment_logger.error(
                f"ALERT: Khach hang buc xuc -- session {request.session_id}"
            )

        return {
            "reply": response["output"],
            "session_id": request.session_id,
            "sentiment": sentiment,
            "alert": is_negative,
            "cards": cards,
            "intent": last_intent,
        }

    except Exception as e:
        sentiment_logger.error(f"chat_endpoint error: {e}")
        return {
            "reply": "Xin loi, da co loi xay ra. Vui long thu lai sau.",
            "error": str(e),
            "cards": [],
            "intent": None,
        }


@app.post("/identify-car-pro")
async def identify_car_pro(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        car_info = identify_car_from_bytes(image_bytes)

        brand = car_info.get("brand", "")
        model = car_info.get("model", "")
        version = car_info.get("version", "")

        if brand == "Unknown" and model == "Unknown":
            return {"success": False, "message": "Không nhận diện được xe trong ảnh.", "data": []}

        filtered_cars = []

        if brand and model:
            db_result = get_inventory(car_name=model, branch_name=brand)
            filtered_cars = db_result.get("data", [])

        if not filtered_cars and model:
            db_result = get_inventory(car_name=model)
            filtered_cars = db_result.get("data", [])

        if not filtered_cars and brand:
            db_result = get_inventory(branch_name=brand)
            filtered_cars = db_result.get("data", [])


        if filtered_cars and version:
            v_lower = version.lower()
            exact_version_cars = [
                c for c in filtered_cars
                if v_lower in (c.get('trim_level') or '').lower() or v_lower in (c.get('car_name') or '').lower()
            ]
            if exact_version_cars:
                filtered_cars = exact_version_cars

        return {
            "success": True,
            "ai_detected": car_info,
            "total_found": len(filtered_cars),
            "data": filtered_cars
        }

    except Exception as e:
        logger.error(f"Error identify_car_pro: {e}")
        import traceback;
        traceback.print_exc()
        return {"success": False, "message": "Lỗi hệ thống.", "data": []}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")