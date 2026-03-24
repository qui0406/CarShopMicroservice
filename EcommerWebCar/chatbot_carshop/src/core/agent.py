# import os
# from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
# from langchain_groq import ChatGroq
# from langchain_core.tools import Tool
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
#
# from src.core.rag_engine import RAGEngine
# from src.tools.finance_tools import calculate_loan
#
#
# def get_car_agent():
#     # 1. Khởi tạo LLM với temperature=0 để giảm sáng tạo
#     llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)
#
#     # 2. Kết nối tới bộ máy truy vấn dữ liệu
#     retriever = RAGEngine().get_retriever()
#
#     def car_kb(q: str) -> str:
#         """Tra cứu kiến thức từ kho dữ liệu Showroom"""
#         docs = retriever.invoke(q)
#
#         # QUAN TRỌNG: Trả về thông báo rõ ràng để Agent không tự bịa
#         if not docs or len(docs) == 0:
#             return "[KHÔNG TÌM THẤY] Không có thông tin về nội dung này trong cơ sở dữ liệu showroom."
#
#         # Thêm metadata để Agent biết nguồn gốc
#         results = []
#         for i, d in enumerate(docs, 1):
#             metadata_info = ""
#             if d.metadata:
#                 metadata_info = f" [Nguồn: {d.metadata.get('Hang_xe', 'N/A')} - {d.metadata.get('Dong_xe', 'N/A')}]"
#             results.append(f"--- Kết quả {i} ---{metadata_info}\n{d.page_content}")
#
#         return "\n\n".join(results)
#
#     def loan_calc(q: str) -> str:
#         """Công cụ tính toán trả góp tài chính"""
#         try:
#             params = dict(item.split("=") for item in q.replace(" ", "").split(","))
#             price = int(params["price"])
#             down = float(params["down_payment_percent"])
#             years = int(params["years"])
#             return calculate_loan(price, down, years)
#         except Exception as e:
#             return f"Lỗi định dạng. Vui lòng dùng: price=700000000, down_payment_percent=20, years=5"
#
#     # 3. Định nghĩa danh sách công cụ
#     tools = [
#         Tool(
#             name="Car_Knowledge_Base",
#             func=car_kb,
#             description=(
#                 "Tool TRA CỨU DUY NHẤT về xe hơi trong showroom. "
#                 "Dùng để tìm: tên xe, giá bán, thông số kỹ thuật, màu sắc, địa chỉ showroom. "
#                 "Input: câu hỏi tiếng Việt. "
#                 "Chỉ trả lời nếu tool này trả về thông tin CỤ THỂ."
#             )
#         ),
#         Tool(
#             name="Loan_Calculator",
#             func=loan_calc,
#             description=(
#                 "Tính số tiền trả góp hàng tháng. "
#                 "Input: price=700000000, down_payment_percent=20, years=5"
#             )
#         ),
#     ]
#
#     # 4. Prompt nghiêm ngặt - CHỐT HÀNH VI
#     prompt = ChatPromptTemplate.from_messages([
#         ("system", """Bạn là Chuyên viên tư vấn tại Showroom ô tô.
#
#     🔴 QUY TẮC TUYỆT ĐỐI (KHÔNG ĐƯỢC VI PHẠM):
#
#     1. NGUỒN THÔNG TIN DUY NHẤT:
#        - Bạn CHỈ được trả lời dựa trên kết quả từ tool `Car_Knowledge_Base`
#        - TUYỆT ĐỐI KHÔNG tự suy luận hoặc dùng kiến thức bên ngoài
#        - Nếu tool trả về "[KHÔNG TÌM THẤY]" → Dừng ngay và nói không biết
#
#     2. XỬ LÝ CÂU HỎI NGOÀI PHẠM VI:
#        - Nếu hỏi về xe KHÔNG có trong showroom → "Dạ, showroom em không có thông tin về mẫu xe này ạ."
#        - Nếu hỏi nội dung KHÔNG liên quan đến xe (thời tiết, tin tức, v.v.) → "Dạ, em chỉ tư vấn về xe hơi tại showroom thôi ạ. Anh/Chị có câu hỏi nào về xe không ạ?"
#
#     3. LỌC DỮ LIỆU CHÍNH XÁC:
#        - Khi tool trả về NHIỀU mẫu xe → Lọc ĐÚNG mẫu xe khách hỏi
#        - VD: Nếu hỏi "Mazda 3 giá bao nhiêu?" mà tool trả về cả Mazda 3 và CX-5 → CHỈ nói về Mazda 3
#
#     4. ĐỊNH DẠNG TRẢ LỜI:
#        - Ngắn gọn, lịch sự, chuyên nghiệp
#        - VD: "Mazda 3 2024 có giá từ 669 triệu đồng. Xe trang bị động cơ Skyactiv-G 2.0L, tiết kiệm nhiên liệu. Anh/Chị muốn biết thêm thông tin gì không ạ?"
#
#     5. XỬ LÝ NGỮ CẢNH:
#        - Dựa vào `chat_history` để hiểu "nó", "xe đó", "mẫu này"
#        - VD: User hỏi "giá xe nào?" sau khi nói về Mazda 3 → Tự hiểu là hỏi giá Mazda 3
#
#     🚫 CẤM TUYỆT ĐỐI:
#        - Không tự bịa giá, thông số, địa chỉ
#        - Không nói "theo tôi biết...", "thông thường...", "có thể..."
#        - Không so sánh với xe ngoài showroom nếu không có trong dữ liệu
#        - Không gọi tool nhiều lần cho cùng 1 câu hỏi đã có đáp án"""),
#
#         MessagesPlaceholder(variable_name="chat_history"),
#         ("human", "{input}"),
#         MessagesPlaceholder(variable_name="agent_scratchpad"),
#     ])
#
#     # 5. Khởi tạo Agent với giới hạn chặt chẽ
#     agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)
#
#     return AgentExecutor(
#         agent=agent,
#         tools=tools,
#         verbose=True,
#         max_iterations=3,
#         handle_parsing_errors=True,
#         early_stopping_method="force",
#         return_intermediate_steps=False  # Ẩn bước suy nghĩ với user
#     )


import os
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_core.tools import StructuredTool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field

from src.core.rag_engine import RAGEngine
from src.tools.finance_tools import calculate_loan


class CarKnowledgeInput(BaseModel):
    query: str = Field(description="Câu hỏi về xe hơi bằng tiếng Việt")


class LoanCalculatorInput(BaseModel):
    price: int = Field(description="Giá xe (VNĐ)")
    down_payment_percent: float = Field(description="Phần trăm trả trước (%)")
    years: int = Field(description="Số năm vay")


def get_car_agent():
    # LLM configuration
    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",  # hoặc model nào bạn đang dùng
        temperature=0,
        groq_api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=1000  # ✅ THÊM DÒNG NÀY - giới hạn output
    )

    # Kết nối RAG - KHÔNG DÙNG THRESHOLD
    retriever = RAGEngine().get_retriever(use_threshold=False)

    def car_knowledge_search(query: str) -> str:
        """Tìm kiếm thông tin xe trong cơ sở dữ liệu showroom"""
        try:
            docs = retriever.invoke(query)

            if not docs or len(docs) == 0:
                return "[KHÔNG TÌM THẤY] Không có thông tin về nội dung này trong cơ sở dữ liệu showroom."

            # Lọc kết quả theo xe được hỏi
            query_lower = query.lower()
            target_car = None

            if "mazda 3" in query_lower or "mazda3" in query_lower:
                target_car = "Mazda 3"
            elif "cx-5" in query_lower or "cx5" in query_lower or "cx 5" in query_lower:
                target_car = "Mazda CX-5"

            if target_car:
                filtered_docs = [
                    d for d in docs
                    if target_car in d.metadata.get('Dong_xe', '')
                ]
                if filtered_docs:
                    docs = filtered_docs

            # Giới hạn 2 kết quả
            docs = docs[:2]

            results = []
            for i, d in enumerate(docs, 1):
                metadata_info = ""
                if d.metadata:
                    dong_xe = d.metadata.get('Dong_xe', 'N/A')
                    metadata_info = f" [Xe: {dong_xe}]"

                # Giới hạn độ dài content
                content = d.page_content[:600]
                results.append(f"[Kết quả {i}]{metadata_info}\n{content}")

            return "\n\n".join(results)
        except Exception as e:
            return f"[LỖI] Không thể tìm kiếm: {str(e)}"

    def calculate_loan_payment(price: int, down_payment_percent: float, years: int) -> str:
        """Tính toán số tiền trả góp hàng tháng"""
        try:
            return calculate_loan(price, down_payment_percent, years)
        except Exception as e:
            return f"Lỗi tính toán: {str(e)}"

    # Khởi tạo tools
    tools = [
        StructuredTool.from_function(
            func=car_knowledge_search,
            name="Car_Knowledge_Base",
            description=(
                "Tìm kiếm thông tin về xe hơi trong showroom. "
                "Dùng khi khách hỏi về: giá xe, thông số, màu sắc, địa chỉ. "
                "CHỈ GỌI 1 LẦN, sau đó trả lời ngay dựa trên kết quả."
            ),
            args_schema=CarKnowledgeInput,
            return_direct=False  # Quan trọng: để Agent xử lý kết quả
        ),
        StructuredTool.from_function(
            func=calculate_loan_payment,
            name="Loan_Calculator",
            description=(
                "Tính trả góp hàng tháng. Dùng khi khách hỏi về tài chính, trả góp."
            ),
            args_schema=LoanCalculatorInput,
            return_direct=False
        ),
    ]

    # Prompt RÕ RÀNG để Agent biết khi nào dừng
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Bạn là Tư vấn viên Showroom ô tô chuyên nghiệp.

CÁCH LÀM VIỆC:
1. Đọc câu hỏi của khách
2. Nếu cần thông tin xe → Gọi tool Car_Knowledge_Base MỘT LẦN
3. Đọc kết quả từ tool
4. TRẢ LỜI NGAY cho khách dựa trên kết quả (KHÔNG gọi tool lần 2)

QUY TẮC TRẢ LỜI:
- Nếu tool trả về thông tin → Tóm tắt ngắn gọn và trả lời
- Nếu tool trả "[KHÔNG TÌM THẤY]" → Nói: "Dạ, em chưa có thông tin về xe này ạ"
- Nếu hỏi chuyện riêng → "Em chỉ tư vấn về xe ạ"
- Trả lời TỰ NHIÊN, LỊCH SỰ, ngắn gọn (2-3 câu)

VÍ DỤ:
Khách: "Mazda 3 giá bao nhiêu?"
Bước 1: Gọi Car_Knowledge_Base với "Mazda 3 giá"
Bước 2: Đọc kết quả → Thấy giá 669-869 triệu
Bước 3: Trả lời NGAY: "Dạ Mazda 3 có 3 phiên bản với giá từ 669 đến 869 triệu đồng ạ. Anh/chị quan tâm phiên bản nào ạ?"

QUAN TRỌNG: Sau khi gọi tool 1 lần, PHẢI trả lời ngay. KHÔNG gọi tool lần 2 cho cùng câu hỏi."""),

        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # Tạo agent
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,  # Tăng lên 5 để đủ cho: tool call + final answer
        max_execution_time=30,  # Timeout sau 30 giây
        handle_parsing_errors=True,
        early_stopping_method="generate",  # Thay "force" bằng "generate" để Agent tạo câu trả lời
        return_intermediate_steps=False
    )