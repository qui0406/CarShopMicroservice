import os
import sys
from dotenv import load_dotenv

# 1. Định nghĩa các đường dẫn chuẩn (Tuyệt đối)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Thêm thư mục gốc vào hệ thống để Python tìm thấy folder 'src'
sys.path.append(BASE_DIR)

from src.core.rag_engine import RAGEngine

# 2. Nạp API Key từ file .env
load_dotenv(os.path.join(BASE_DIR, ".env"))


def run_ingestion():
    try:
        print("--- 🏁 Bắt đầu quy trình nạp dữ liệu ---")

        # Đường dẫn tới thư mục chứa file markdown
        markdown_path = os.path.join(BASE_DIR, "data", "markdown")

        # Kiểm tra thư mục có tồn tại không
        if not os.path.exists(markdown_path):
            print(f"❌ Lỗi: Không tìm thấy thư mục tại {markdown_path}")
            return

        # Khởi tạo RAG Engine
        engine = RAGEngine()

        print(f"--- 🧠 Đang xử lý Chunking & Embedding từ: {markdown_path} ---")
        print("--- ⏳ Vui lòng đợi, quá trình này có thể mất vài giây...")

        # Gọi hàm nạp dữ liệu với đường dẫn tuyệt đối
        result = engine.ingest_markdown(data_path=markdown_path)

        print(f"✅ Hoàn tất: {result}")
        print(f"📁 Dữ liệu Vector đã lưu tại: {os.path.join(BASE_DIR, engine.persist_directory)}")

    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {str(e)}")


if __name__ == "__main__":
    # 3. Kiểm tra bảo mật API Key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "sk-" not in api_key:
        print("❌ Lỗi: OPENAI_API_KEY không hợp lệ hoặc trống trong file .env")
    else:
        run_ingestion()