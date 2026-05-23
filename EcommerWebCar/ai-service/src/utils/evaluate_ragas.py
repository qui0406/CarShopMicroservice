import os
import sys
import pandas as pd
from dotenv import load_dotenv

# Thêm thư mục gốc vào PYTHONPATH để có thể import các module trong src
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if base_dir not in sys.path:
    sys.path.append(base_dir)

from src.core.rag_engine import RAGEngine
from src.core.agent import get_car_agent

# Nạp file môi trường .env
load_dotenv(os.path.join(base_dir, ".env"))

# Ánh xạ OPEN_API_KEY sang OPENAI_API_KEY cho Ragas nhận diện
if os.getenv("OPEN_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.getenv("OPEN_API_KEY")

def run_ragas_evaluation():
    print("=" * 60)
    print(" BẮT ĐẦU ĐÁNH GIÁ CHẤT LƯỢNG RAG VỚI RAGAS FRAMEWORK")
    print("=" * 60)

    # 1. Định nghĩa tập dữ liệu kiểm thử (Testset) thực tế của Showroom
    test_cases = [
        {
            "question": "Tôi mua xe mới tại showroom thì được hưởng chính sách bảo hành chính hãng như thế nào và điều kiện để được bảo hành là gì?",
            "ground_truth": (
                "Tất cả xe mới tại showroom được bảo hành chính hãng bao gồm: Bảo hành xe 3 năm hoặc 100.000 km "
                "(tùy điều kiện nào đến trước), bảo hành pin xe điện/hybrid trong 8 năm hoặc 160.000 km, bảo hành sơn 3 năm "
                "và cung cấp dịch vụ cứu hộ 24/7 trong suốt thời gian bảo hành. Điều kiện áp dụng bảo hành là khách hàng cần thực hiện "
                "bảo dưỡng định kỳ đúng lịch tại đại lý ủy quyền."
            )
        },
        {
            "question": "Quy định đổi trả xe của showroom như thế nào? Trường hợp nào tôi được đổi xe và trường hợp nào không được áp dụng?",
            "ground_truth": (
                "Khách hàng có thể đổi xe trong vòng 7 ngày kể từ ngày nhận xe nếu gặp lỗi kỹ thuật từ nhà sản xuất hoặc xe không đúng thông số "
                "đã ký trong hợp đồng mua bán. Showroom tuyệt đối không áp dụng chính sách đổi trả đối với các trường hợp khách hàng tự ý thay đổi sở thích cá nhân, "
                "hoặc xe đã qua sử dụng và hoàn toàn không phát hiện lỗi kỹ thuật nào từ nhà sản xuất."
            )
        },
        {
            "question": "Hãy so sánh giúp tôi xe Mazda CX-5 và Hyundai Creta, tôi nên chọn mẫu xe nào để chủ yếu đi lại trong thành phố và tiết kiệm nhiên liệu?",
            "ground_truth": (
                "Nếu anh/chị ưu tiên tiết kiệm nhiên liệu, ngân sách mua xe hạn chế hơn và chủ yếu đi lại linh hoạt trong thành phố thì nên chọn Hyundai Creta "
                "(SUV hạng B với động cơ 1.5L tiết kiệm hơn). Ngược lại, nếu anh/chị cần một không gian rộng rãi hơn cho gia đình 4-5 người, đề cao cảm giác lái đầm chắc, "
                "cách âm tốt và thường xuyên di chuyển đường trường thì Mazda CX-5 (SUV hạng C với động cơ 2.0L mạnh mẽ) sẽ là sự lựa chọn tốt hơn."
            )
        },
        {
            "question": "Nếu xe tôi bị chết máy khi đang đi trên đường cao tốc thì dịch vụ cứu hộ 24/7 của showroom có được miễn phí hoàn toàn không?",
            "ground_truth": (
                "Dịch vụ cứu hộ sẽ miễn phí kéo xe về xưởng đại lý gần nhất nếu xe của anh/chị vẫn còn trong thời hạn bảo hành (3 năm hoặc 100.000 km) "
                "và nguyên nhân sự cố chết máy xuất phát từ lỗi kỹ thuật của nhà sản xuất. Nếu sự cố xuất phát từ lỗi chủ quan của người lái "
                "(như hết xăng, đâm đụng, lội nước ngập gây thủy kích hoặc nổ lốp), chi phí thớt kéo cứu hộ sẽ do chủ xe tự chi trả hoặc phía bảo hiểm thân vỏ hỗ trợ."
            )
        }
    ]

    # 2. Khởi tạo RAG Engine & Agent để sinh câu trả lời thực tế
    try:
        rag_engine = RAGEngine()
        retriever = rag_engine.get_retriever(use_threshold=False)
        agent_executor = get_car_agent()
    except Exception as e:
        print(f"[ERROR] Không thể khởi tạo RAG Engine hoặc Agent. Chi tiết: {e}")
        return

    questions = []
    answers = []
    contexts_list = []
    ground_truths = []

    print(f"\n---> Đang tiến hành chạy thử nghiệm trên {len(test_cases)} kịch bản...")
    for idx, case in enumerate(test_cases, 1):
        q = case["question"]
        gt = case["ground_truth"]
        print(f"\n[TestCase {idx}] Hỏi: {q}")

        # A. Truy hồi context thực tế từ vector db
        retrieved_docs = []
        try:
            docs = retriever.invoke(q)
            retrieved_docs = [doc.page_content for doc in docs]
            print(f"   -> Truy hồi thành công: {len(retrieved_docs)} đoạn tài liệu liên quan.")
        except Exception as err:
            print(f"   -> [WARNING] Lỗi khi truy hồi: {err}")
            retrieved_docs = ["Không tìm thấy ngữ cảnh thích hợp trong kho FAQ."]

        # B. Sinh câu trả lời từ LLM Agent
        try:
            res = agent_executor.invoke({"input": q, "chat_history": []})
            ans = res["output"]
            print(f"   -> AI trả lời: {ans[:100]}...")
        except Exception as err:
            print(f"   -> [WARNING] Lỗi sinh câu trả lời: {err}")
            ans = "Gặp sự cố kết nối với mô hình ngôn ngữ."

        questions.append(q)
        answers.append(ans)
        contexts_list.append(retrieved_docs)
        ground_truths.append(gt)

    # 3. Tạo Dataset cấu trúc theo chuẩn Ragas
    data = {
        "question": questions,
        "answer": answers,
        "contexts": contexts_list,
        "ground_truth": ground_truths
    }

    try:
        from datasets import Dataset
        from ragas import evaluate
        from ragas.metrics import Faithfulness, AnswerRelevancy, ContextRecall, ContextPrecision
        from ragas.llms import llm_factory
        from langchain_openai import OpenAIEmbeddings
        from openai import OpenAI

        # Cấu hình rõ ràng LLM và Embeddings của Ragas để đảm bảo tính tương thích
        openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        ragas_llm = llm_factory("gpt-3.5-turbo", client=openai_client)
        ragas_emb = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

        # Khởi tạo các đối tượng metric với LLM và Embeddings cụ thể
        faithfulness = Faithfulness(llm=ragas_llm)
        answer_relevancy = AnswerRelevancy(llm=ragas_llm, embeddings=ragas_emb)
        context_recall = ContextRecall(llm=ragas_llm)
        context_precision = ContextPrecision(llm=ragas_llm)
    except Exception as imp_err:
        print("\n" + "!" * 80)
        print(f" [CHÚ Ý] Lỗi khi import hoặc khởi tạo các metric Ragas: {imp_err}")
        print(" Vui lòng kiểm tra lại môi trường và thư viện cài đặt.")
        print("!" * 80 + "\n")
        
        # In ra bảng dữ liệu chuẩn bị đánh giá để người dùng dễ quan sát cấu trúc
        df_demo = pd.DataFrame(data)
        print("Dưới đây là bảng dữ liệu cấu trúc thu thập được (sẵn sàng chuyển cho Ragas):")
        print(df_demo.to_string())
        return

    # Khởi tạo dataset HuggingFace
    dataset = Dataset.from_dict(data)

    print("\n---> Đang kết nối OpenAI API để thực hiện chấm điểm đánh giá (LLM-as-a-judge)...")
    try:
        result = evaluate(
            dataset=dataset,
            metrics=[
                faithfulness,
                answer_relevancy,
                context_recall,
                context_precision
            ],
            llm=ragas_llm,
            embeddings=ragas_emb
        )
        
        print("\n" + "=" * 60)
        print(" KẾT QUẢ ĐÁNH GIÁ CHẤT LƯỢNG RAG (RAGAS SCORES)")
        print("=" * 60)
        
        df_result = result.to_pandas()
        print(df_result[["user_input", "faithfulness", "answer_relevancy", "context_recall", "context_precision"]].to_string())
        
        print("\n--- ĐIỂM SỐ TRUNG BÌNH TOÀN HỆ THỐNG ---")
        for key, val in getattr(result, "_repr_dict", {}).items():
            print(f"★ {key.upper()}: {val * 100:.2f}%")
        print("=" * 60)
        
    except Exception as eval_err:
        print(f"[ERROR] Có lỗi xảy ra trong quá trình đánh giá: {eval_err}")
        import traceback
        traceback.print_exc()
        print("Vui lòng kiểm tra lại cấu hình OPENAI_API_KEY hoặc tài khoản OpenAI.")

if __name__ == "__main__":
    run_ragas_evaluation()
