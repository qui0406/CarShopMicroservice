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

except ImportError as e:

    sys.exit(1)


def run_ingestion():
    try:
        markdown_path = ROOT_DIR / "data" / "chatbot"

        if not markdown_path.exists():
            return

        engine = RAGEngine()
        result = engine.ingest_markdown(data_path=str(markdown_path))
    except Exception as e:
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print(f"Lỗi: OPENAI_API_KEY trống. Hãy kiểm tra file .env tại: {env_path}")
    elif not api_key.startswith("sk-"):
        print("Lỗi: OPENAI_API_KEY không đúng định dạng sk-...")
    else:
        run_ingestion()