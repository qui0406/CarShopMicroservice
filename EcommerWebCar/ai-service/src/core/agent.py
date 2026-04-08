import os
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_core.tools import StructuredTool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field
import logging

from src.utils.finance_tools import get_car_and_calculate_rolling

from src.core.rag_engine import RAGEngine
from src.utils.db_utils import (
    query_mysql_safe
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class MySQLQueryInput(BaseModel):
    intent: str = Field(
        description=(
            "Loai thong tin can truy van. Chon 1 trong:\n"
            "  'list_cars'     -- Liet ke xe dang co\n"
            "  'car_detail'    -- Chi tiet 1 xe cu the\n"
            "  'inventory'     -- Kiem tra con xe hay khong\n"
            "  'showroom_info' -- Dia chi, SDT, Zalo showroom\n"
            "  'appraisal'     -- Tra cuu dinh gia xe cu"
        )
    )
    car_name: str = Field(default="", description="Ten xe. VD: 'Mazda CX-5'")
    car_id: str = Field(default="", description="ID xe trong database.")
    branch_name: str = Field(default="", description="Ten chi nhanh showroom.")
    category_name: str = Field(default="", description="Loai xe. VD: 'SUV', 'Sedan'")
    body_type: str = Field(default="", description="Kieu than xe ENUM. VD: 'SUV', 'SEDAN'")
    fuel_type: str = Field(default="", description="Nhien lieu ENUM. VD: 'XANG', 'DIEN', 'HYBRID'")
    user_id: str = Field(default="", description="User ID, dung khi intent='appraisal'")
    request_id: str = Field(default="", description="Ma yeu cau dinh gia.")

class RollingPriceInput(BaseModel):
    car_name: str = Field(description="Tên xe cần tính giá lăn bánh. VD: 'Mazda 3', 'CX-5'")
    address: str = Field(default="HCM", description="Tỉnh thành đăng ký xe. VD: 'Hà Nội', 'HCM', 'Đà Nẵng'")
    quantity: int = Field(default=1, description="Số lượng xe mua.")


class CarFAQInput(BaseModel):
    query: str = Field(description="Cau hoi tu van, FAQ, so sanh xe bang tieng Viet")


def get_car_agent():
    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0,
        groq_api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=1000,
    )

    def rolling_price_logic(car_name: str, address: str, quantity: int = 1) -> str:
        return get_car_and_calculate_rolling(car_name, address, quantity)

    retriever = RAGEngine().get_retriever(use_threshold=False)


    def mysql_query(
        intent: str,
        car_name: str = "",
        car_id: str = "",
        branch_name: str = "",
        category_name: str = "",
        body_type: str = "",
        fuel_type: str = "",
        user_id: str = "",
        request_id: str = "",
    ) -> str:
        return query_mysql_safe(
            intent=intent,
            car_name=car_name,
            car_id=car_id,
            branch_name=branch_name,
            category_name=category_name,
            body_type=body_type,
            fuel_type=fuel_type,
            user_id=user_id,
            request_id=request_id,
        )


    def car_faq_search(query: str) -> str:
        try:
            docs = retriever.invoke(query)
            if not docs:
                return "[KHONG TIM THAY] Chua co tai lieu lien quan trong FAQ."

            results = []
            for i, d in enumerate(docs[:3], 1):
                dong_xe  = d.metadata.get("Dong_xe", "Chung")
                phan_muc = d.metadata.get("Phan_muc", "")
                header   = f"Dong xe: {dong_xe}" + (f" | Muc: {phan_muc}" if phan_muc else "")
                results.append(f"Tai lieu {i} [{header}] ---\n{d.page_content[:600]}")

            return "\n\n".join(results)
        except Exception as e:
            logger.error(e)


    tools = [
        StructuredTool.from_function(
            func=mysql_query,
            name="MySQL_Query_Tool",
            args_schema=MySQLQueryInput,
        ),

        StructuredTool.from_function(
            func=rolling_price_logic,
            name="Calculate_Rolling_Price",
            description=(
                "Dùng khi khách hỏi 'giá lăn bánh', 'tổng cộng bao nhiêu tiền', 'mua xe hết bao nhiêu'. "
                "Tool này sẽ tự tìm giá xe trong database và tính các loại thuế phí."
            ),
            args_schema=RollingPriceInput,
        ),
        StructuredTool.from_function(
            func=mysql_query,
            name="MySQL_Query_Tool",
            description=(
                "Truy van du lieu THUC TE tu database showroom. "
                "BAT BUOC dung khi khach hoi:\n"
                "  - 'Showroom co xe gi?' -> intent='list_cars'\n"
                "  - 'Con xe X khong?' -> intent='inventory'\n"
                "  - 'Thong so/gia xe X?' -> intent='car_detail'\n"
                "  - 'Dia chi/SDT?' -> intent='showroom_info'\n"
                "  - 'Dinh gia xe cu' -> intent='appraisal'\n"
                "KHONG dung cho: so sanh xe, FAQ, quy trinh mua."
            ),
            args_schema=MySQLQueryInput,
            return_direct=False,
        ),
        StructuredTool.from_function(
            func=car_faq_search,
            name="Car_FAQ_Knowledge",
            description=(
                "Tim kiem trong tai lieu FAQ noi bo (.md). "
                "Dung khi khach hoi: so sanh xe, quy trinh mua, "
                "bao hanh, cau hoi thuong gap, tu van chon xe."
            ),
            args_schema=CarFAQInput,
            return_direct=False,
        ),
        StructuredTool.from_function(
            name="Loan_Calculator",
            description="Tinh tien tra gop hang thang khi biet gia xe, % tra truoc, so nam vay.",
            return_direct=False,
        ),
    ]


    prompt = ChatPromptTemplate.from_messages([
        ("system", """Ban la Tu van vien Showroom o to chuyen nghiep, nhiet tinh.
Xung "em", goi khach la "anh/chi".

NGUYEN TAC SU DUNG TOOL:
- "Gia xe / Con xe gi"              -> MySQL_Query_Tool
- "Gia lan banh / Tong chi phi mua" -> Calculate_Rolling_Price
- "So sanh / Tu van / Bao hanh"     -> Car_FAQ_Knowledge
- "Co xe gi / dang ban gi"           -> MySQL_Query_Tool intent="list_cars"
- "Thong so / gia xe X"              -> MySQL_Query_Tool intent="car_detail"
- "Con hang khong / ton kho"         -> MySQL_Query_Tool intent="inventory"
- "Dia chi / SDT / Zalo showroom"    -> MySQL_Query_Tool intent="showroom_info"
- "Dinh gia / xe cu"                 -> MySQL_Query_Tool intent="appraisal"
- "So sanh / quy trinh / bao hanh"   -> Car_FAQ_Knowledge
- "Tra gop / tai chinh"              -> Loan_Calculator

QUY TAC:
1. Goi tool TOI DA 1 lan moi loai. Sau khi co ket qua -> TRA LOI NGAY.
2. Neu tool tra "[DB_ERROR]" -> "Da em chua tim duoc thong tin, anh/chi lien he truc tiep nhe."
3. Neu hoi ngoai chu de xe -> "Em chi tu van ve xe o to thoi a."
4. Tra loi ngan gon 2-4 cau, ket thuc bang 1 cau hoi goi mo."""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=6,
        max_execution_time=30,
        handle_parsing_errors=True,
        early_stopping_method="generate",
        return_intermediate_steps=False,
    )