import os
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import StructuredTool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field
import logging

from src.utils.finance_tools import get_car_and_calculate_rolling

from src.core.rag_engine import RAGEngine
from src.utils.db_utils import (
    query_mysql_safe,
    set_last_result
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
    min_price: str | float = Field(default=None, description="Gia thap nhat (VNĐ). VD: 500000000 cho 500 trieu.")
    max_price: str | float = Field(default=None, description="Gia cao nhat (VNĐ). VD: 1000000000 cho 1 ty.")

class RollingPriceInput(BaseModel):
    car_name: str = Field(description="Tên xe cần tính giá lăn bánh. VD: 'Mazda 3', 'CX-5'")
    address: str = Field(default="HCM", description="Tỉnh thành đăng ký xe. VD: 'Hà Nội', 'HCM', 'Đà Nẵng'")
    year: int | None = Field(default=None, description="Năm sản xuất của xe (nếu khách hàng chỉ định hoặc đang thảo luận về đời xe cụ thể). VD: 2026, 2023")
    quantity: str | int = Field(default=1, description="Số lượng xe mua.")


class CarFAQInput(BaseModel):
    query: str = Field(description="Cau hoi tu van, FAQ, so sanh xe bang tieng Viet")


class LoanFinanceInput(BaseModel):
    query: str = Field(
        description="Cau hoi ve tra gop, lai suat, thoi han vay, tai chinh mua xe bang tieng Viet"
    )


def get_car_agent():
    llm = ChatOpenAI(
        model_name="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv("OPEN_API_KEY"),
        max_tokens=1000,
    )

    def rolling_price_logic(car_name: str, address: str, year: int | None = None, quantity: str | int = 1) -> str:
        summary, data = get_car_and_calculate_rolling(
            car_name=car_name,
            address=address,
            year=year,
            quantity=quantity
        )
        if data:
            set_last_result("rolling_price", data)
        else:
            set_last_result("rolling_price", {"car_name": car_name, "address": address, "year": year})
        return summary

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
        min_price: float | str = None,
        max_price: float | str = None,
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
            min_price=min_price,
            max_price=max_price,
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
            return f"[LOI_FAQ] Khong doc duoc kho tai lieu FAQ. Chi tiet: {e!s}"


    def loan_finance_guidance(query: str) -> str:
        return (
            "[TRA_GOP_TAI_CHINH] He thong chua tinh tra gop tu dong. "
            "Hay tom tat nhu cau cua khach (xe quan tam, so tien tra truoc neu co) "
            "va de nghi anh/chi lien he truc tiep showroom de duoc tu van lai suat va thoi han vay chinh xac."
        )

    tools = [
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
                "Truy van du lieu THUC TE tu database showroom de hien thi the san pham (cards) cho khach. "
                "BAT BUOC dung khi:\n"
                "  - Khach tim xe theo tieu chi (gia, ten xe, loai xe...) -> intent='list_cars'\n"
                "  - Khach hoi chi tiet 1 xe cu the -> intent='car_detail'\n"
                "  - Ban muon de xuat hoac hien thi mot mau xe cu the cho khach sau khi da tim tren FAQ.\n"
                "  - Kiem tra ton kho -> intent='inventory'\n"
                "  - Tra cuu dinh gia xe cu -> intent='appraisal'"
            ),
            args_schema=MySQLQueryInput,
            return_direct=False,
        ),
        StructuredTool.from_function(
            func=car_faq_search,
            name="Car_FAQ_Knowledge",
            description=(
                "Tim kiem trong tai lieu FAQ noi bo. "
                "Dung khi khach hoi so sanh xe, quy trinh mua, bao hanh, hoac hoi y kien tu van chung chung. "
                "LUU Y: Doi voi cac cau hoi tu van/FAQ thong thuong, KHONG CAN goi MySQL_Query_Tool de hien thi the xe, tru khi khach hang chu dong yeu cau tim xe co san trong showroom hoac muon xem chi tiet xe ban."
            ),
            args_schema=CarFAQInput,
            return_direct=False,
        ),
        StructuredTool.from_function(
            func=loan_finance_guidance,
            name="Loan_Finance_Guidance",
            description=(
                "Dung khi khach hoi ve tra gop, vay ngan hang, lai suat, thoi han vay, "
                "so tien hang thang, tai chinh mua xe. Tra ve huong dan: chua tinh tu dong, can lien he showroom."
            ),
            args_schema=LoanFinanceInput,
            return_direct=False,
        ),
    ]


    from src.utils.prompt_loader import load_prompt
    system_prompt_content = load_prompt("agent_system_prompt.txt")

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt_content),
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
        early_stopping_method="force",
        return_intermediate_steps=False,
    )