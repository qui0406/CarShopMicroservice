"""
Mazda Reference Price Service
Lookup giá xe Mazda mới từ CSV theo model/year, sau đó dùng làm anchor cho ML model.
"""
import csv
import logging
from pathlib import Path
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
_REF_CSV  = _DATA_DIR / "mazda_reference_prices.csv"

# Cache: list of dicts loaded from CSV
_price_table: list[dict] = []


def _load_price_table() -> None:
    global _price_table
    if not _REF_CSV.exists():
        logger.warning(f"Mazda reference CSV not found: {_REF_CSV}")
        return
    try:
        with open(_REF_CSV, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            _price_table = [
                {
                    "model":     row["model"].strip().lower(),
                    "trim":      row["trim"].strip().lower(),
                    "body_type": row["body_type"].strip().lower(),
                    "segment":   row["segment"].strip().lower(),
                    "year":      int(row["year"]),
                    "price":     float(row["new_price_million"]),
                    "notes":     row.get("notes", "").strip(),
                }
                for row in reader
                if row.get("model") and row.get("year") and row.get("new_price_million")
            ]
        logger.info(f"Loaded {len(_price_table)} Mazda reference price records.")
    except Exception as e:
        logger.error(f"Failed to load Mazda reference CSV: {e}")


_load_price_table()


def lookup_mazda_price(model_name: str, year: int, trim_name: str = "") -> Tuple[Optional[float], str]:
    """
    Tra cứu giá xe Mazda mới nhất theo model, năm và trim.
    Returns: (price_in_million, match_description)

    Chiến lược khớp (theo độ ưu tiên giảm dần):
    1. Khớp chính xác: model + year + trim
    2. Khớp gần: model + year (không quan tâm trim)
    3. Khớp linh hoạt: model + năm gần nhất (±2 năm)
    4. Không tìm thấy → trả về None
    """
    if not _price_table:
        return None, "CSV không tải được"

    model_lower = model_name.strip().lower()
    trim_lower  = trim_name.strip().lower()

    # Filter các bản ghi có model khớp (fuzzy)
    candidates = [
        row for row in _price_table
        if row["model"] in model_lower or model_lower in row["model"]
    ]

    if not candidates:
        return None, f"Không tìm thấy '{model_name}' trong bảng tham chiếu"

    # Level 1: exact year + trim
    if trim_lower:
        exact = [
            r for r in candidates
            if r["year"] == year and (trim_lower in r["trim"] or r["trim"] in trim_lower)
        ]
        if exact:
            r = exact[0]
            return r["price"], f"Khớp chính xác: {r['model']} {r['trim']} {r['year']}"

    # Level 2: exact year, any trim → average
    year_match = [r for r in candidates if r["year"] == year]
    if year_match:
        avg = sum(r["price"] for r in year_match) / len(year_match)
        return round(avg, 1), f"Khớp năm {year}: trung bình {len(year_match)} phiên bản"

    # Level 3: nearest year (±3)
    for delta in [1, 2, 3]:
        for dy in [delta, -delta]:
            near = [r for r in candidates if r["year"] == year + dy]
            if near:
                avg = sum(r["price"] for r in near) / len(near)
                actual_year = year + dy
                return round(avg, 1), f"Năm {year} chưa có dữ liệu → dùng {actual_year} (±{abs(dy)} năm)"

    # Level 4: any year → use latest available
    latest = max(candidates, key=lambda r: r["year"])
    return latest["price"], f"Dùng dữ liệu năm mới nhất ({latest['year']}), không có {year}"


def get_model_info(model_name: str, year: int) -> dict:
    """Trả về thông tin phân khúc và body_type của dòng xe."""
    model_lower = model_name.strip().lower()
    candidates  = [
        r for r in _price_table
        if r["model"] in model_lower or model_lower in r["model"]
    ]
    if not candidates:
        return {"segment": "Unknown", "body_type": "Unknown"}
    # Prefer matching year
    year_match = [r for r in candidates if r["year"] == year]
    chosen = year_match[0] if year_match else candidates[0]
    return {
        "segment":   chosen["segment"],
        "body_type": chosen["body_type"],
    }
