import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent

if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

env_path = ROOT_DIR / ".env"
load_dotenv(dotenv_path=env_path)

try:
    from src.core.rag_engine import RAGEngine

    print("✅ Đã kết nối với RAG Engine")
except ImportError as e:
    print(f"❌ Lỗi Import: Không tìm thấy src.core.rag_engine. {e}")
    sys.exit(1)


def run_ingestion():
    try:
        print("--- 🏁 Bắt đầu quy trình nạp dữ liệu ---")

        # Đường dẫn tới thư mục chứa file markdown (theo cấu trúc ảnh của Quí)
        # Nếu Quí để file ở ai-service/data/chatbot/
        markdown_path = ROOT_DIR / "data" / "chatbot"

        if not markdown_path.exists():
            print(f"❌ Lỗi: Không tìm thấy thư mục chứa dữ liệu tại: {markdown_path}")
            return

        # Khởi tạo RAG Engine
        engine = RAGEngine()

        print(f"--- 🧠 Đang xử lý Embedding từ: {markdown_path} ---")
        # Chuyển Path object sang string để truyền vào hàm
        result = engine.ingest_markdown(data_path=str(markdown_path))

        print(f"✅ Hoàn tất nạp dữ liệu vào Vector DB!")
        print(f"📁 Database lưu tại: {ROOT_DIR / 'data' / 'vector_db'}")

    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Kiểm tra bảo mật API Key
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print(f"❌ Lỗi: OPENAI_API_KEY trống. Hãy kiểm tra file .env tại: {env_path}")
    elif not api_key.startswith("sk-"):
        print("❌ Lỗi: OPENAI_API_KEY không đúng định dạng sk-...")
    else:
        run_ingestion()