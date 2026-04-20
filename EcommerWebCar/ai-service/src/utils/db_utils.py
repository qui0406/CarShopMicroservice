import os
from contextlib import contextmanager
from typing import Optional

import mysql.connector
from mysql.connector import Error as MySQLError
from dotenv import load_dotenv

load_dotenv()


def _get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DB"),
        charset="utf8mb4",
        connect_timeout=5,
    )


@contextmanager
def _db():
    conn = _get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        yield cur
    finally:
        conn.close()


def get_all_cars(
    branch_name: Optional[str] = None,
    category_name: Optional[str] = None,
    body_type: Optional[str] = None,
    fuel_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> dict:
    conditions = ["c.is_used = 0"]
    params: list = []

    if branch_name:
        conditions.append("cb.name LIKE %s")
        params.append(f"%{branch_name}%")
    if category_name:
        conditions.append("cat.name LIKE %s")
        params.append(f"%{category_name}%")
    if body_type:
        conditions.append("ts.body_type = %s")
        params.append(body_type.upper())
    if fuel_type:
        conditions.append("ts.fuel_type = %s")
        params.append(fuel_type.upper())
    if min_price is not None:
        conditions.append("c.price >= %s")
        params.append(min_price)
    if max_price is not None:
        conditions.append("c.price <= %s")
        params.append(max_price)

    sql = f"""
        SELECT
            c.id                    AS car_id,
            cm.name                 AS car_name,
            c.color                 AS color,
            c.price                 AS price,
            c.manufacturing_year    AS year,
            c.mileage               AS mileage,
            cm.name                 AS model_name,
            cm.seat_capacity        AS seats,
            cm.thumbnail_image      AS thumbnail,
            ts.body_type            AS body_type,
            ts.fuel_type            AS fuel_type,
            ts.transmission         AS transmission,
            ts.trim_level           AS trim_level,
            cb.name                 AS branch_name,
            cat.name                AS category
        FROM car c
        JOIN  car_model      cm  ON cm.id  = c.car_model_id
        LEFT JOIN car_branch     cb  ON cb.id  = cm.car_branch_id
        LEFT JOIN car_category   cat ON cat.id = cm.category_id
        LEFT JOIN technical_spec ts  ON ts.id  = cm.technical_spec_id
        WHERE {' AND '.join(conditions)}
        ORDER BY c.price ASC
        LIMIT 2
    """

    with _db() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    if not rows:
        return {"status": "empty", "text": "Hiện tại showroom chưa có xe nào phù hợp.", "data": []}

    for r in rows:
        if r.get("price"):
            r["price_formatted"] = f"{int(r['price']):,} VNĐ"

    lines = ["Dưới đây là một số xe đại diện phù hợp nhất:"]
    for r in rows:
        price_str  = r.get("price_formatted", "Liên hệ")
        body_str   = f" [{r['body_type']}]"    if r.get("body_type")   else ""
        fuel_str   = f" — {r['fuel_type']}"    if r.get("fuel_type")   else ""
        color_str  = f" — {r['color']}"        if r.get("color")       else ""
        branch_str = f" | {r['branch_name']}"  if r.get("branch_name") else ""
        lines.append(
            f"  • {r['car_name']} ({r['year']}){body_str}{fuel_str}{color_str}"
            f" — {price_str}{branch_str}"
        )
    lines.append("\n(Mời anh/chị xem thêm chi tiết tất cả các xe tại website của showroom ạ!)")

    return {"status": "ok", "text": "\n".join(lines), "data": rows}


def get_car_detail(
    car_name: Optional[str] = None,
    car_id: Optional[str] = None,
) -> dict:
    if not car_name and not car_id:
        return {"status": "error", "text": "Cần tên xe hoặc car_id.", "data": {}}

    conditions = ["c.is_used = 0"]
    params: list = []

    if car_id:
        conditions.append("c.id = %s")
        params.append(car_id)
    else:
        conditions.append("cm.name LIKE %s")
        params.append(f"%{car_name}%")

    sql = f"""
        SELECT
            c.id,
            cm.name                 AS car_name,
            c.color,
            c.price,
            c.manufacturing_year    AS year,
            c.mileage,
            c.vin_number,
            c.inspection_report_url,
            cm.name                 AS model_name,
            cm.seat_capacity        AS seats,
            cm.description          AS model_description,
            cm.thumbnail_image      AS thumbnail,
            cb.name                 AS branch_name,
            cat.name                AS category,
            ts.body_type,
            ts.fuel_type,
            ts.engine,
            ts.engine_size,
            ts.transmission,
            ts.trim_level,
            ts.displacement,
            ts.horsepower,
            ts.torque,
            ts.top_speed,
            ts.length,
            ts.width,
            ts.height,
            ts.ground_clearance,
            ts.fuel_capacity,
            eq.has_air_conditioning,
            eq.screen_type,
            eq.seat_material,
            eq.speaker_system,
            eq.sun_roof,
            eq.wireless_charge,
            eq.electric_trunk,
            eq.has_bluetooth,
            eq.has_gps,
            eq.headlamp_type,
            eq.wiper_type,
            eq.smart_key,
            eq.electric_mirror,
            eq.brake_type,
            eq.has_airbags,
            eq.electronic_stability,
            eq.lane_keep_assist,
            eq.has_camera,
            eq.parking_sensor
        FROM car c
        JOIN  car_model      cm  ON cm.id  = c.car_model_id
        LEFT JOIN car_branch     cb  ON cb.id  = cm.car_branch_id
        LEFT JOIN car_category   cat ON cat.id = cm.category_id
        LEFT JOIN technical_spec ts  ON ts.id  = cm.technical_spec_id
        LEFT JOIN equipment      eq  ON eq.id  = cm.equipment_id
        WHERE {' AND '.join(conditions)}
        LIMIT 1
    """

    with _db() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()

        images = []
        if row:
            cur.execute("SELECT image FROM car_image WHERE car_id = %s LIMIT 6", (row["id"],))
            images = [r["image"] for r in cur.fetchall()]

    if not row:
        return {
            "status": "not_found",
            "text": f"Không tìm thấy xe '{car_name or car_id}' trong showroom.",
            "data": {}
        }

    if row.get("price"):
        row["price_formatted"] = f"{int(row['price']):,} VNĐ"
    row["images"] = images

    text_parts = [
        f"{row['car_name']} ({row['year']})"
        + (f" — {row['color']}" if row.get("color") else ""),
        f"Giá: {row.get('price_formatted', 'Liên hệ')}",
    ]
    if row.get("body_type"):
        text_parts.append(f"Kiểu dáng: {row['body_type']} — {row.get('seats', '?')} chỗ")
    if row.get("trim_level"):
        text_parts.append(f"Phiên bản: {row['trim_level']}")
    if row.get("branch_name"):
        text_parts.append(f"Hãng: {row['branch_name']}")
    if row.get("engine"):
        text_parts.append(
            f"Động cơ: {row['engine']}"
            + (f" {row['engine_size']}" if row.get("engine_size") else "")
            + (f" — {row['horsepower']} HP" if row.get("horsepower") else "")
        )
    if row.get("torque"):
        text_parts.append(f"Mô-men xoắn: {row['torque']} Nm")
    if row.get("transmission"):
        text_parts.append(f"Hộp số: {row['transmission']}")
    if row.get("fuel_type"):
        text_parts.append(f"Nhiên liệu: {row['fuel_type']}")
    if row.get("top_speed"):
        text_parts.append(f"Tốc độ tối đa: {row['top_speed']} km/h")
    if row.get("fuel_capacity"):
        text_parts.append(f"Dung tích bình: {row['fuel_capacity']} lít")

    feature_map = {
        "has_airbags":          "Túi khí",
        "has_camera":           "Camera 360/lùi",
        "has_gps":              "Định vị GPS",
        "smart_key":            "Chìa khóa thông minh",
        "parking_sensor":       "Cảm biến đỗ xe",
        "lane_keep_assist":     "Hỗ trợ giữ làn",
        "electronic_stability": "Cân bằng điện tử",
        "sun_roof":             f"Cửa sổ trời ({row.get('sun_roof', '')})" if row.get("sun_roof") else None,
        "wireless_charge":      "Sạc không dây",
        "has_bluetooth":        "Bluetooth",
        "electric_trunk":       "Cốp điện",
        "electric_mirror":      "Gương điện",
    }
    features = [label for key, label in feature_map.items() if label and row.get(key)]
    if row.get("seat_material"):
        features.append(f"Ghế {row['seat_material']}")
    if row.get("screen_type"):
        features.append(f"Màn hình {row['screen_type']}")
    if features:
        text_parts.append(f"✨ Trang bị: {', '.join(features)}")

    return {"status": "ok", "text": "\n".join(text_parts), "data": row}


def get_inventory(
    car_name: Optional[str] = None,
    branch_name: Optional[str] = None,
) -> dict:
    conditions = ["i.quantity > 0"]
    params: list = []

    if car_name:
        conditions.append("cm.name LIKE %s")
        params.append(f"%{car_name}%")
    if branch_name:
        conditions.append("cb.name LIKE %s")
        params.append(f"%{branch_name}%")

    sql = f"""
        SELECT
            cm.name              AS car_name,
            c.color              AS color,
            c.manufacturing_year AS year,
            c.price,
            i.quantity,
            ts.body_type         AS body_type,
            ts.fuel_type         AS fuel_type,
            sr.name              AS showroom_name,
            sr.address,
            sr.phone,
            sr.zalo,
            cb.name              AS branch_name
        FROM inventory i
        JOIN car        c   ON c.id   = i.car_id
        JOIN car_model  cm  ON cm.id  = c.car_model_id
        LEFT JOIN technical_spec ts  ON ts.id  = cm.technical_spec_id
        LEFT JOIN car_branch     cb  ON cb.id  = cm.car_branch_id
        LEFT JOIN show_room      sr  ON sr.id  = i.show_room_id
        WHERE {' AND '.join(conditions)}
        ORDER BY i.quantity DESC
        LIMIT 2
    """

    with _db() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    if not rows:
        q = f"{car_name or ''} {branch_name or ''}".strip()
        return {"status": "empty", "text": f"Hiện không có xe '{q}' trong kho.", "data": []}

    for r in rows:
        if r.get("price"):
            r["price_formatted"] = f"{int(r['price']):,} VNĐ"

    lines = ["Tồn kho hiện tại (hiển thị đại diện):"]
    for r in rows:
        price_str  = r.get("price_formatted", "Liên hệ")
        color_str  = f" — {r['color']}"          if r.get("color")        else ""
        sr_str     = f" tại {r['showroom_name']}" if r.get("showroom_name") else ""
        phone_str  = f" | {r['phone']}"        if r.get("phone")         else ""
        zalo_str   = f" | Zalo: {r['zalo']}"   if r.get("zalo")          else ""
        lines.append(
            f"  • {r['car_name']} ({r['year']}){color_str}"
            f" — còn {r['quantity']} xe{sr_str} — {price_str}{phone_str}{zalo_str}"
        )
    lines.append("\n(Mời anh/chị truy cập website để xem danh sách đầy đủ nhé!)")

    return {"status": "ok", "text": "\n".join(lines), "data": rows}


def get_showroom_info(branch_name: Optional[str] = None) -> dict:
    conditions = []
    params: list = []

    if branch_name:
        conditions.append("sr.name LIKE %s")
        params.append(f"%{branch_name}%")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    sql = f"""
        SELECT
            sr.name, sr.address, sr.phone, sr.email,
            sr.zalo, sr.facebook, sr.about,
            sr.latitude, sr.longitude
        FROM show_room sr
        {where}
        ORDER BY sr.name
        LIMIT 5
    """

    with _db() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    if not rows:
        return {"status": "empty", "text": "Không tìm thấy thông tin showroom.", "data": []}

    lines = ["🏢 Thông tin showroom:"]
    for r in rows:
        lines.append(f"\n  {r['name']}")
        lines.append(f"     Địa chỉ: {r.get('address', 'N/A')}")
        if r.get("phone"):    lines.append(f" SĐT: {r['phone']}")
        if r.get("zalo"):     lines.append(f" Zalo: {r['zalo']}")
        if r.get("email"):    lines.append(f" Email: {r['email']}")
        if r.get("facebook"): lines.append(f" Facebook: {r['facebook']}")
        if r.get("about"):    lines.append(f" {r['about'][:120]}...")

    return {"status": "ok", "text": "\n".join(lines), "data": rows}


def get_appraisal_status(
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> dict:
    if not user_id and not request_id:
        return {"status": "error", "text": "Cần cung cấp user_id hoặc mã yêu cầu.", "data": []}

    conditions = []
    params: list = []
    if request_id:
        conditions.append("ar.id = %s")
        params.append(request_id)
    else:
        conditions.append("ar.user_id = %s")
        params.append(user_id)

    sql = f"""
        SELECT
            ar.id, ar.status, ar.created_at,
            ar.expected_price, ar.offered_price,
            ar.manufacturing_year, ar.mileage,
            ar.condition_note,
            cm.name AS model_name,
            cb.name AS branch_name
        FROM appraisal_requests ar
        LEFT JOIN car_model  cm ON cm.id = ar.model_id
        LEFT JOIN car_branch cb ON cb.id = ar.branch_id
        WHERE {' AND '.join(conditions)}
        ORDER BY ar.created_at DESC
        LIMIT 5
    """

    with _db() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    if not rows:
        return {"status": "empty", "text": "Không tìm thấy yêu cầu định giá nào.", "data": []}

    lines = ["Trạng thái định giá xe cũ:"]
    for r in rows:
        exp = f"{int(r['expected_price']):,}" if r.get("expected_price") else "?"
        off = f"{int(r['offered_price']):,}"  if r.get("offered_price")  else "Chưa có"
        lines.append(
            f"\n  • Mã #{r['id'][:8]}..."
            f"\n    Xe: {r.get('model_name', 'N/A')} ({r.get('manufacturing_year', '?')}, {r.get('mileage', '?')} km)"
            f"\n    Trạng thái: {r['status']}"
            f"\n    Giá mong đợi: {exp} VNĐ | Giá đề nghị: {off} VNĐ"
            f"\n    Chi nhánh: {r.get('branch_name', 'N/A')}"
        )
        if r.get("condition_note"):
            lines.append(f" Ghi chú: {r['condition_note']}")

    return {"status": "ok", "text": "\n".join(lines), "data": rows}


INTENT_HANDLERS = {
    "list_cars":     get_all_cars,
    "car_detail":    get_car_detail,
    "inventory":     get_inventory,
    "showroom_info": get_showroom_info,
    "appraisal":     get_appraisal_status,
}

_last_result: dict = {"intent": None, "data": None}


def get_last_result() -> dict:
    return _last_result.copy()


def reset_last_result() -> None:
    _last_result["intent"] = None
    _last_result["data"]   = None


def set_last_result(intent: str, data: any) -> None:
    if not data:
        return
    _last_result["intent"] = intent
    _last_result["data"]   = data


def query_mysql_safe(
    intent: str,
    car_name: str = "",
    car_id: str = "",
    branch_name: str = "",
    category_name: str = "",
    body_type: str = "",
    fuel_type: str = "",
    user_id: str = "",
    request_id: str = "",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> str:
    intent = intent.strip().lower()

    if intent not in INTENT_HANDLERS:
        valid = ", ".join(INTENT_HANDLERS.keys())
        return f"[LOI] Intent '{intent}' khong hop le. Chi chap nhan: {valid}"

    try:
        if intent == "list_cars":
            result = get_all_cars(
                branch_name=branch_name or None,
                category_name=category_name or None,
                body_type=body_type or None,
                fuel_type=fuel_type or None,
                min_price=min_price,
                max_price=max_price
            )
        elif intent == "car_detail":
            result = get_car_detail(car_name or None, car_id or None)
        elif intent == "inventory":
            result = get_inventory(car_name or None, branch_name or None)
        elif intent == "showroom_info":
            result = get_showroom_info(branch_name or None)
        elif intent == "appraisal":
            result = get_appraisal_status(user_id or None, request_id or None)
        else:
            result = {"status": "error", "text": "Intent khong xu ly duoc.", "data": {}}

        data = result.get("data", [])
        # Chỉ lưu kết quả khi DB thực sự có dữ liệu (tránh ghi đè bằng list rỗng)
        if data:
            _last_result["intent"] = intent
            _last_result["data"]   = data
        return result.get("text", "")

    except MySQLError as e:
        return f"[DB_ERROR] {e}"
    except Exception as e:
        return f"[ERROR] {e}"