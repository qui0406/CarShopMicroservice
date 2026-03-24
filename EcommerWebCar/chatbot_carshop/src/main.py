import os
import uvicorn
import ssl
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain & Redis
from langchain_core.globals import set_llm_cache
from langchain_redis import RedisSemanticCache
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Nội bộ dự án
from src.core.agent import get_car_agent
from src.core.rag_engine import RAGEngine
from src.core.vision_engine import detect_and_crop_car, pil_to_base64

from src.utils.logger import get_logger

from src.utils.analysis import analyze_sentiment

logger = get_logger("MAIN_SERVICE")
sentiment_logger = get_logger("SENTIMENT_ANALYSIS")

# 0. Sửa lỗi SSL cho MacOS khi tải YOLO
ssl._create_default_https_context = ssl._create_unverified_context
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# 1. Load environment variables
load_dotenv()

# 2. KHỞI TẠO VISION MODEL
vision_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",  # ✅ Pro mạnh hơn Flash
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

app = FastAPI(title="Chatbot Showroom Ô tô", version="1.0.0")

# 3. Khởi tạo Engine và Cache
engine = RAGEngine()
try:
    set_llm_cache(RedisSemanticCache(
        redis_url="redis://localhost:6379",
        embeddings=engine.embeddings,
        distance_threshold=0.1
    ))
    print("✅ Redis Semantic Cache đã được khởi tạo")
except Exception as e:
    print(f"⚠️ Không thể kết nối Redis Cache: {e}")

# 4. Khởi tạo Agent
agent_executor = get_car_agent()
print("✅ Agent đã sẵn sàng")


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_user"


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Chatbot Showroom ô tô đang hoạt động với Redis Cache!",
        "endpoints": {
            "chat": "/chat",
            "health": "/health",
            "identify-car-pro": "/identify-car-pro"
        }
    }


@app.get("/health")
def health_check():
    """Endpoint kiểm tra sức khỏe hệ thống"""
    try:
        # Test Redis connection
        test_history = RedisChatMessageHistory(
            session_id="health_check_test",
            url="redis://localhost:6379"
        )
        test_history.clear()

        return {
            "status": "healthy",
            "redis": "connected",
            "agent": "ready",
            "vision_model": "gemini-2.5-flash"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Khởi tạo lịch sử chat từ Redis
        history = RedisChatMessageHistory(
            session_id=request.session_id,
            url="redis://localhost:6379",
            ttl=3600
        )

        # 2. PHÂN TÍCH CẢM XÚC (Thêm mới)
        # Phân tích ngay tin nhắn 'input' của người dùng
        sentiment = analyze_sentiment(request.message)

        # Ghi log trạng thái cảm xúc của khách hàng
        sentiment_logger.info(f"Session: {request.session_id} | Message: {request.message} | Sentiment: {sentiment}")

        # 3. GỌI AGENT XỬ LÝ
        response = agent_executor.invoke({
            "input": request.message,
            "chat_history": history.messages
        })

        # 4. LƯU LỊCH SỬ VÀ KIỂM TRA CẢNH BÁO
        history.add_user_message(request.message)
        history.add_ai_message(response["output"])

        # Nếu cảm xúc tiêu cực, đánh dấu để Frontend có thể hiển thị hỗ trợ khẩn cấp
        is_negative = "NEGATIVE" in sentiment
        if is_negative:
            sentiment_logger.error(f"🚨 ALERT: Khách hàng đang bức xúc tại session {request.session_id}!")

        return {
            "reply": response["output"],
            "session_id": request.session_id,
            "sentiment": sentiment,  # Trả về để hiển thị icon cảm xúc nếu cần
            "alert": is_negative  # Thông báo cho UI biết khách hàng cần hỗ trợ gấp
        }

    except Exception as e:
        sentiment_logger.error(f"❌ Error in chat_endpoint: {e}")
        return {
            "reply": "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
            "error": str(e)
        }


@app.post("/clear-history")
async def clear_history(session_id: str = "default_user"):
    """Xóa lịch sử chat của một session"""
    try:
        history = RedisChatMessageHistory(
            session_id=session_id,
            url="redis://localhost:6379"
        )
        history.clear()

        return {
            "message": f"Đã xóa lịch sử chat của session: {session_id}"
        }
    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/identify-car-pro")
async def identify_car_pro(file: UploadFile = File(...)):
    """
    Quy trình Hybrid AI: YOLO (Local) -> Gemini Vision (Cloud) -> RAG (Database)

    Upload ảnh xe qua form-data với key 'file'
    """
    try:
        # Bước 1: YOLO Detection & Crop
        print("🔍 Đang phát hiện xe trong ảnh...")
        image_bytes = await file.read()
        cropped_car = detect_and_crop_car(image_bytes)

        if not cropped_car:
            logger.warning("⚠️ YOLO không phát hiện thấy ô tô trong ảnh.")
            return {
                "error": "Không tìm thấy ô tô trong ảnh. Vui lòng chụp rõ xe hơn.",
                "identified_car": None,
                "consultation": None,
                "in_stock": False
            }
        logger.info("✅ YOLO phát hiện và cắt ảnh thành công.")

        # Bước 2: Chuyển đổi sang Base64
        print("📸 Đang chuẩn bị ảnh...")
        base64_str = pil_to_base64(cropped_car)



        # Bước 3: Định danh xe bằng Vision LLM với prompt chi tiết
        print("🤖 Đang nhận diện xe bằng Gemini Vision...")
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": """Phân tích ảnh xe này và nhận diện chính xác:

**BƯỚC 1: Quan sát Logo**
- Nhìn kỹ LOGO trên lưới tản nhiệt (radiator grille)
- Logo hình tam diện (Trident) → Maserati
- Logo ngôi sao 3 cánh → Mercedes-Benz
- Logo vòng tròn BMW → BMW
- Logo 4 vòng tròn → Audi
- Logo chữ M → Mazda
- Logo chữ H thẳng → Honda
- Logo chữ H nghiêng → Hyundai
- Logo chữ T oval → Toyota

**BƯỚC 2: Phân tích thiết kế**
- Hình dáng lưới tản nhiệt (hình thang, lục giác, chữ nhật...)
- Kiểu đèn pha (LED, Xenon, thiết kế đặc trưng...)
- Đường nét thân xe (coupe, sedan, SUV, crossover...)

**BƯỚC 3: Xác định mẫu xe**
- Dựa vào đặc điểm trên, xác định hãng và mẫu xe cụ thể

Trả về ĐÚNG format: [Hãng xe] [Tên mẫu]
Ví dụ: "Mazda 3", "Toyota Camry", "Honda CR-V", "Hyundai Creta"

⚠️ QUAN TRỌNG: Chỉ trả về tên xe, KHÔNG giải thích thêm."""
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_str}"}
                }
            ]
        )

        car_name_response = vision_llm.invoke([message])
        car_name = car_name_response.content.strip()
        print(f"🎯 Nhận diện ban đầu: {car_name}")

        # Bước 3.5: Xác minh xe có trong showroom không
        print("🔍 Đang kiểm tra xe trong database showroom...")
        verification_result = agent_executor.invoke({
            "input": f"Showroom có bán xe {car_name} không? Chỉ trả lời CÓ hoặc KHÔNG, kèm lý do ngắn gọn.",
            "chat_history": []
        })

        verification_text = verification_result["output"].lower()
        in_stock = "có" in verification_text and "không" not in verification_text.split("có")[0]

        print(f"{'✅' if in_stock else '❌'} Xe {'có' if in_stock else 'không có'} trong showroom")

        # Bước 4: Truy vấn RAG để lấy thông tin
        if in_stock:
            print("📚 Đang tìm kiếm thông tin xe trong database...")
            final_result = agent_executor.invoke({
                "input": f"Tư vấn ngắn gọn về xe {car_name}",
                "chat_history": []
            })
            consultation = final_result["output"]
        else:
            # Xe không có trong showroom
            consultation = f"Dạ, showroom em hiện chưa có xe {car_name}. Anh/chị có thể tham khảo các dòng xe khác như Mazda 3, Mazda CX-5, Hyundai Creta ạ. Em có thể tư vấn thêm về các xe này nếu anh/chị quan tâm."

        print("✅ Hoàn thành tư vấn!")
        return {
            "identified_car": car_name,
            "consultation": consultation,
            "in_stock": in_stock,
            "note": "💡 Kết quả nhận diện tự động. Vui lòng xác nhận lại nếu cần chính xác 100%."
        }

    except Exception as e:
        print(f"❌ Error in identify_car_pro: {e}")
        import traceback
        traceback.print_exc()

        return {
            "error": f"Lỗi xử lý ảnh: {str(e)}",
            "identified_car": None,
            "consultation": None,
            "in_stock": False
        }


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚗 CHATBOT SHOWROOM Ô TÔ với AI Vision")
    print("=" * 60)
    print("📍 Server: http://0.0.0.0:8000")
    print("📖 Docs: http://0.0.0.0:8000/docs")
    print("🤖 Vision Model: Gemini 2.5 Flash")
    print("🔍 Features: YOLO + Vision AI + RAG + Verification")
    print("=" * 60 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )