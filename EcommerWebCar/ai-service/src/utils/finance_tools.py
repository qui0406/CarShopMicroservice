from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Literal

from src.utils.db_utils import _get_connection, _normalize_search_param


def get_car_and_calculate_rolling(car_name: str, address: str, quantity: int = 1):
    conn = _get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        import re
        # Chuẩn hóa tên xe và sửa lỗi chính tả thương hiệu
        car_name = _normalize_search_param(car_name)

        # Trích xuất năm sản xuất nếu có trong câu hỏi (ví dụ: 2018)
        year_match = re.search(r'\b(20\d{2})\b', car_name)
        year_filter = None
        if year_match:
            year_filter = int(year_match.group(1))
            # Loại bỏ năm ra khỏi tên xe để tìm kiếm model chính xác hơn
            car_name = car_name.replace(year_match.group(0), "").strip()

        words = car_name.split()
        short_name = " ".join(words[:2]) if len(words) >= 2 else car_name

        conditions = []
        params = []

        # Điều kiện tìm theo tên xe/model
        conditions.append("(cm.name LIKE %s OR cm.name LIKE %s)")
        params.extend([f"%{car_name}%", f"%{short_name}%"])

        # Nếu có lọc theo năm, chèn thêm điều kiện sản xuất vào SQL
        if year_filter:
            conditions.append("c.manufacturing_year = %s")
            params.append(year_filter)

        query = f"""
            SELECT 
                c.id as car_id,
                cm.name as model_name, 
                c.price as base_price, 
                ts.fuel_type,
                c.manufacturing_year as year,
                cm.thumbnail_image as thumbnail,
                ts.engine,
                (SELECT image FROM car_image WHERE car_id = c.id ORDER BY id ASC LIMIT 1) AS first_image
            FROM car_model cm
            JOIN car c ON c.car_model_id = cm.id
            LEFT JOIN technical_spec ts ON ts.id = c.technical_spec_id
            WHERE {" AND ".join(conditions)}
            ORDER BY c.price ASC
            LIMIT 1
        """
        cursor.execute(query, params)
        car = cursor.fetchone()

        if not car:
            return f"Xin lỗi Quí, mình không tìm thấy xe '{car_name}' trong kho.", None

        result = calculate_rolling_price(
            base_price=car['base_price'],
            address=address,
            fuel_type=car['fuel_type'],
            quantity=quantity
        )

        data = {
            "car_id": car['car_id'],
            "car_name": car['model_name'],
            "price": int(car['base_price']),
            "price_formatted": result["unit_rolling_price"],
            "rolling_price_detail": result,
            "year": car['year'],
            "thumbnail": car['thumbnail'],
            "first_image": car['first_image'],
            "engine": car['engine']
        }

        return result["summary"], data
    finally:
        cursor.close()
        conn.close()



FIXED_REGISTRATION_FEE = Decimal("2_500_000")

_TAX_RATE_TABLE: dict[str, dict[str, Decimal]] = {
    "HN": {
        "ELECTRIC": Decimal("0.06"),
        "GASOLINE": Decimal("0.12"),
        "DIESEL":   Decimal("0.12"),
        "HYBRID":   Decimal("0.09"),
    },
    "HCM": {
        "ELECTRIC": Decimal("0.06"),
        "GASOLINE": Decimal("0.12"),
        "DIESEL":   Decimal("0.12"),
        "HYBRID":   Decimal("0.09"),
    },
    "DEFAULT": {
        "ELECTRIC": Decimal("0.06"),
        "GASOLINE": Decimal("0.10"),
        "DIESEL":   Decimal("0.10"),
        "HYBRID":   Decimal("0.08"),
    },
}

_PLATE_FEE_TABLE: dict[str, Decimal] = {
    "HN":      Decimal("20_000_000"),
    "HCM":     Decimal("20_000_000"),
    "DEFAULT": Decimal("1_000_000"),
}

ProvinceCode = Literal["HN", "HCM", "DEFAULT"]
FuelType     = Literal["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]


def _resolve_province(address: str) -> ProvinceCode:
    addr = address.upper()
    if any(k in addr for k in ("HÀ NỘI", "HA NOI", " HN", "HANOI")):
        return "HN"
    if any(k in addr for k in ("HỒ CHÍ MINH", "HO CHI MINH", "HCM", "TPHCM", "SAIGON", "SÀI GÒN")):
        return "HCM"
    return "DEFAULT"


def _resolve_fuel(fuel_type: str) -> FuelType:
    f = fuel_type.upper().strip()
    if f in ("ELECTRIC", "ĐIỆN", "EV"):
        return "ELECTRIC"
    if f in ("HYBRID", "XĂNG-ĐIỆN"):
        return "HYBRID"
    if f in ("DIESEL", "DẦU"):
        return "DIESEL"
    return "GASOLINE"   # mặc định


def calculate_registration_tax(
    base_price: Decimal,
    address: str,
    fuel_type: str,
) -> Decimal:
    province = _resolve_province(address)
    fuel     = _resolve_fuel(fuel_type)
    rate     = _TAX_RATE_TABLE.get(province, _TAX_RATE_TABLE["DEFAULT"]).get(fuel, Decimal("0.10"))
    return (base_price * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def calculate_plate_fee(address: str) -> Decimal:
    province = _resolve_province(address)
    return _PLATE_FEE_TABLE.get(province, _PLATE_FEE_TABLE["DEFAULT"])


@dataclass
class RollingPriceResult:
    base_price:        Decimal
    registration_tax:  Decimal
    plate_fee:         Decimal
    registration_fee:  Decimal
    total_rolling:     Decimal

    quantity:          int
    total_order:       Decimal

    province:          str
    fuel_type:         str

    def as_dict(self) -> dict:
        fmt = lambda v: f"{int(v):,} VNĐ"
        return {
            "province":          self.province,
            "fuel_type":         self.fuel_type,
            "quantity":          self.quantity,
            "breakdown": {
                "base_price":       fmt(self.base_price),
                "registration_tax": fmt(self.registration_tax),
                "plate_fee":        fmt(self.plate_fee),
                "registration_fee": fmt(self.registration_fee),
            },
            "unit_rolling_price": fmt(self.total_rolling),
            "total_order_price":  fmt(self.total_order),
        }

    def summary(self) -> str:
        lines = [
            f"Giá xe (niêm yết):   {int(self.base_price):>15,} VNĐ",
            f"Thuế trước bạ:       {int(self.registration_tax):>15,} VNĐ",
            f"Phí biển số:         {int(self.plate_fee):>15,} VNĐ",
            f"Phí đăng kiểm:       {int(self.registration_fee):>15,} VNĐ",
            f"{'─'*42}",
            f"Giá lăn bánh/chiếc:  {int(self.total_rolling):>15,} VNĐ",
        ]
        if self.quantity > 1:
            lines.append(
                f"Tổng {self.quantity} xe:          {int(self.total_order):>15,} VNĐ"
            )
        return "\n".join(lines)

def calculate_rolling_price(
    base_price: float | int | str,
    address: str,
    fuel_type: str,
    quantity: int = 1,
) -> dict:
    price = Decimal(str(base_price))
    qty   = max(1, int(quantity))

    reg_tax  = calculate_registration_tax(price, address, fuel_type)
    plate    = calculate_plate_fee(address)
    reg_fee  = FIXED_REGISTRATION_FEE
    rolling  = price + reg_tax + plate + reg_fee

    result = RollingPriceResult(
        base_price=price,
        registration_tax=reg_tax,
        plate_fee=plate,
        registration_fee=reg_fee,
        total_rolling=rolling,
        quantity=qty,
        total_order=rolling * qty,
        province=_resolve_province(address),
        fuel_type=_resolve_fuel(fuel_type),
    )

    output = result.as_dict()
    output["summary"] = result.summary()
    return output


TOOL_SCHEMA = {
    "name": "calculate_rolling_price",
    "description": (
        "Tính giá lăn bánh của một chiếc xe hơi tại Việt Nam. "
        "Bao gồm: thuế trước bạ, phí biển số, phí đăng kiểm. "
        "Dùng khi người dùng hỏi 'giá lăn bánh là bao nhiêu', "
        "'mua xe hết tổng cộng bao nhiêu', 'các loại phí khi mua xe'."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "base_price": {
                "type": "number",
                "description": "Giá xe niêm yết tính bằng VNĐ, ví dụ: 850000000",
            },
            "address": {
                "type": "string",
                "description": "Tỉnh/thành phố đăng ký xe, ví dụ: 'Hà Nội', 'TP.HCM', 'Đà Nẵng'",
            },
            "fuel_type": {
                "type": "string",
                "enum": ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"],
                "description": "Loại nhiên liệu của xe",
            },
            "quantity": {
                "type": "integer",
                "description": "Số lượng xe muốn mua (mặc định 1)",
                "default": 1,
            },
        },
        "required": ["base_price", "address", "fuel_type"],
    },
}

if __name__ == "__main__":
    test_cases = [
        ("850000000", "Hà Nội",   "GASOLINE", 1),
        ("650000000", "TP.HCM",   "DIESEL",   2),
        ("1200000000","Đà Nẵng",  "ELECTRIC", 1),
        ("950000000", "HCM",      "HYBRID",   1),
    ]

    for price, addr, fuel, qty in test_cases:
        print(f"\n{'='*50}")
        print(f"Xe: {price} VNĐ | {addr} | {fuel} | SL: {qty}")
        print("-" * 50)
        res = calculate_rolling_price(price, addr, fuel, qty)
        print(res["summary"])