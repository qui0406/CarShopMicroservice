import os
import shutil
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class RAGEngine:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.persist_directory = os.path.join(self.base_dir, "database", "vector_db")

        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=os.getenv("OPEN_API_KEY")
        )

        self.headers_to_split_on = [
            ("#", "Hang_xe"),
            ("##", "Dong_xe"),
            ("###", "Phan_muc")
        ]

    def _prepare_directory(self):
        if os.path.exists(self.persist_directory):
            shutil.rmtree(self.persist_directory)
        os.makedirs(os.path.dirname(self.persist_directory), exist_ok=True)

    def _split_text(self, documents):
        md_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=self.headers_to_split_on,
            strip_headers=False
        )

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
                logging.error(e)

        return all_splits

    def _create_vector_db(self, splits):
        return Chroma.from_documents(
            documents=splits,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_metadata={"hnsw:space": "cosine"}
        )

    def ingest_markdown(self, data_path):
        try:
            self._prepare_directory()

            loader = DirectoryLoader(
                data_path,
                glob="*.md",
                loader_cls=TextLoader,
                loader_kwargs={'encoding': 'utf-8'}
            )

            docs = loader.load()

            if not docs:
                logger.warning("No documents found in %s", data_path)

            splits = self._split_text(docs)

            if not splits:
                logger.warning("No splits found in %s", data_path)

            self._create_vector_db(splits)

            return "Ban da tao thanh cong"

        except Exception as e:
            logger.error(e)
            return

    def get_retriever(self, use_threshold=True):
        if not os.path.exists(self.persist_directory):
            raise FileNotFoundError(
                "Du lieu khong ton tai"
            )

        vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_metadata={"hnsw:space": "cosine"}
        )

        if use_threshold:
            return vectorstore.as_retriever(
                search_type="similarity_score_threshold",
                search_kwargs={
                    "k": 3,
                    "score_threshold": 0.3
                }
            )
        else:

            return vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )
