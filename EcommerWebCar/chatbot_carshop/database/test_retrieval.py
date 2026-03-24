"""
Script test để kiểm tra RAG retrieval
Chạy: python test_retrieval.py
"""

import os
import sys

# Thêm đường dẫn project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from src.core.rag_engine import RAGEngine


def test_retrieval():
    print("=" * 60)
    print("🔍 KIỂM TRA RAG RETRIEVAL")
    print("=" * 60)

    # Khởi tạo engine
    try:
        engine = RAGEngine()
        print("✅ Khởi tạo RAGEngine thành công")
    except Exception as e:
        print(f"❌ Lỗi khởi tạo: {e}")
        return

    # Kiểm tra vector DB có tồn tại không
    if not os.path.exists(engine.persist_directory):
        print(f"\n❌ Vector DB không tồn tại tại: {engine.persist_directory}")
        print("👉 Vui lòng chạy: python scripts/ingest_data.py")
        return

    print(f"✅ Vector DB tồn tại tại: {engine.persist_directory}")

    # Test các query khác nhau
    test_queries = [
        "Mazda 3",
        "giới thiệu Mazda 3",
        "Mazda3 của shop",
        "giá xe Mazda 3",
        "CX-5",
        "showroom"
    ]

    print("\n" + "=" * 60)
    print("🧪 TEST CÁC QUERY")
    print("=" * 60)

    try:
        retriever = engine.get_retriever()

        for i, query in enumerate(test_queries, 1):
            print(f"\n--- Query {i}: '{query}' ---")
            docs = retriever.invoke(query)

            if not docs:
                print("⚠️  Không tìm thấy kết quả nào")
            else:
                print(f"✅ Tìm thấy {len(docs)} kết quả:")
                for j, doc in enumerate(docs, 1):
                    print(f"\n  Kết quả {j}:")
                    print(f"  - Metadata: {doc.metadata}")
                    print(f"  - Content preview: {doc.page_content[:150]}...")

    except Exception as e:
        print(f"❌ Lỗi khi test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_retrieval()