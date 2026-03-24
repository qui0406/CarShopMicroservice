import os
import shutil
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter


class RAGEngine:
    def __init__(self):
        # Thiết lập đường dẫn gốc dự án
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.persist_directory = os.path.join(self.base_dir, "database", "vector_db")

        # Mô hình đa ngôn ngữ tốt cho tiếng Việt
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            model_kwargs={'device': 'cpu'},  # Hoặc 'cuda' nếu có GPU
            encode_kwargs={'normalize_embeddings': True}  # Chuẩn hóa vector
        )

        # Cấu trúc tách Markdown theo tiêu đề
        self.headers_to_split_on = [
            ("#", "Hang_xe"),
            ("##", "Dong_xe"),
            ("###", "Phan_muc")
        ]

    def _prepare_directory(self):
        """Xóa dữ liệu cũ để đảm bảo tính nhất quán"""
        if os.path.exists(self.persist_directory):
            shutil.rmtree(self.persist_directory)
        os.makedirs(os.path.dirname(self.persist_directory), exist_ok=True)

    def _split_text(self, documents):
        """Chia nhỏ văn bản giữ lại Metadata"""
        md_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=self.headers_to_split_on,
            strip_headers=False  # Giữ lại tiêu đề trong nội dung
        )

        # Tăng chunk_size lên 800 để chứa đủ thông tin 1 mẫu xe
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        all_splits = []
        for doc in documents:
            try:
                header_splits = md_splitter.split_text(doc.page_content)
                final_splits = text_splitter.split_documents(header_splits)
                all_splits.extend(final_splits)
            except Exception as e:
                print(f"⚠️ Cảnh báo: Không thể xử lý file {doc.metadata.get('source', 'unknown')}: {e}")

        return all_splits

    def _create_vector_db(self, splits):
        """Khởi tạo cơ sở dữ liệu Vector với Cosine similarity"""
        return Chroma.from_documents(
            documents=splits,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_metadata={"hnsw:space": "cosine"}
        )

    def ingest_markdown(self, data_path):
        """Luồng nạp dữ liệu (Ingestion Pipeline)"""
        try:
            self._prepare_directory()

            # Load tất cả file .md với encoding UTF-8
            loader = DirectoryLoader(
                data_path,
                glob="*.md",
                loader_cls=TextLoader,
                loader_kwargs={'encoding': 'utf-8'}
            )

            docs = loader.load()

            if not docs:
                return "❌ Không tìm thấy file markdown nào trong thư mục."

            splits = self._split_text(docs)

            if not splits:
                return "❌ Không tạo được chunk nào từ dữ liệu."

            self._create_vector_db(splits)

            return f"✅ Thành công: Đã nạp {len(splits)} đoạn văn bản từ {len(docs)} file vào ChromaDB."

        except Exception as e:
            return f"❌ Lỗi: {str(e)}"

    def get_retriever(self, use_threshold=True):
        """Khởi tạo bộ truy xuất với hoặc không có threshold"""
        if not os.path.exists(self.persist_directory):
            raise FileNotFoundError(
                f"❌ Dữ liệu Vector chưa tồn tại tại {self.persist_directory}. "
                f"Vui lòng chạy 'python scripts/ingest_data.py' trước."
            )

        vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_metadata={"hnsw:space": "cosine"}
        )

        if use_threshold:
            # Dùng threshold thấp
            return vectorstore.as_retriever(
                search_type="similarity_score_threshold",
                search_kwargs={
                    "k": 3,
                    "score_threshold": 0.3  # Rất thấp để test
                }
            )
        else:
            # Không dùng threshold - luôn trả về kết quả
            return vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )

    def test_query(self, query: str):
        """Hàm test để kiểm tra retrieval (dùng cho debug)"""
        retriever = self.get_retriever()
        docs = retriever.invoke(query)

        print(f"\n🔍 Query: {query}")
        print(f"📊 Số kết quả: {len(docs)}")

        for i, doc in enumerate(docs, 1):
            print(f"\n--- Kết quả {i} ---")
            print(f"Content: {doc.page_content[:200]}...")
            print(f"Metadata: {doc.metadata}")

        return docs