import base64
import csv
import numpy as np
import cv2
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# src/services/ -> root -> data/info/
BASE_DIR      = Path(__file__).resolve().parents[2]
_PENALTY_CSV  = BASE_DIR / "data" / "info" / "mazda_standard.csv"

_penalty_cache: dict[str, float] = {}


def _load_penalty_table() -> None:
    if not _PENALTY_CSV.exists():
        logger.warning(f"Penalty table không tìm thấy: {_PENALTY_CSV}")
        return

    try:
        with open(_PENALTY_CSV, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]

            for row in reader:
                key = row.get("item_key", "").strip()
                val = (
                    row.get("penalty_price") or
                    row.get("penalty") or
                    "0"
                ).strip()

                if not key:
                    continue

                try:
                    _penalty_cache[key] = float(val.replace(",", "."))
                except ValueError:
                    logger.warning(f"Giá trị penalty không hợp lệ cho key: {key}")
                    _penalty_cache[key] = 0.0

    except Exception as e:
        logger.error(e)


_load_penalty_table()


def get_penalty(item_key: str) -> float:
    val = _penalty_cache.get(item_key)
    if val is None:
        logger.warning(
            f"[PENALTY] Không tìm thấy key: '{item_key}' "
            f"(repr={repr(item_key)}) | "
            f"Cache hiện có: {list(_penalty_cache.keys())}"
        )
        return 0.0
    return val


def to_base64(image_bgr: np.ndarray) -> str:
    if image_bgr is None:
        return ""
    _, buf = cv2.imencode(".jpg", image_bgr)
    return base64.b64encode(buf).decode("utf-8")
