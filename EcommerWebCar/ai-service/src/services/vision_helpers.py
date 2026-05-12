import base64
import csv
import numpy as np
import cv2
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

BASE_DIR     = Path(__file__).resolve().parents[2]
_PENALTY_CSV = BASE_DIR / "data" / "penalty" / "mazda_penalty.csv"

_adjustment_cache: dict[str, float] = {}
_type_cache:       dict[str, str]   = {}   # "PENALTY" | "BONUS"


def _load_penalty_table() -> None:
    if not _PENALTY_CSV.exists():
        logger.warning(f"Adjustment table không tìm thấy: {_PENALTY_CSV}")
        return

    try:
        with open(_PENALTY_CSV, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]

            for row in reader:
                key      = row.get("item_key", "").strip()
                val_str  = (row.get("penalty_price") or row.get("penalty") or "0").strip()
                row_type = row.get("type", "PENALTY").strip().upper()

                if not key:
                    continue

                try:
                    _adjustment_cache[key] = float(val_str.replace(",", "."))
                    _type_cache[key]       = row_type
                except ValueError:
                    logger.warning(f"Giá trị không hợp lệ cho key: {key}")
                    _adjustment_cache[key] = 0.0
                    _type_cache[key]       = "PENALTY"

    except Exception as e:
        logger.error(e)


_load_penalty_table()


def _get_raw(item_key: str) -> float:
    val = _adjustment_cache.get(item_key)
    if val is None:
        logger.warning(
            f"[ADJUSTMENT] Không tìm thấy key: '{item_key}' | "
            f"Cache hiện có: {list(_adjustment_cache.keys())}"
        )
        return 0.0
    return val


def get_penalty(item_key: str) -> float:
    return abs(_get_raw(item_key))


def get_bonus(item_key: str) -> float:
    return abs(_get_raw(item_key))


def get_item_type(item_key: str) -> str:
    return _type_cache.get(item_key, "PENALTY")


def is_bonus_key(item_key: str) -> bool:
    return _type_cache.get(item_key, "PENALTY") == "BONUS"


def to_base64(image_bgr: np.ndarray) -> str:
    if image_bgr is None:
        return ""
    _, buf = cv2.imencode(".jpg", image_bgr)
    return base64.b64encode(buf).decode("utf-8")
