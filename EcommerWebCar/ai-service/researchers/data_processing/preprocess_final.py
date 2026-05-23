import os
import cv2
import pandas as pd
import numpy as np
import re
from datetime import datetime
import logging
from sklearn.model_selection import train_test_split

# ─── Paths ───────────────────────────────────────────────────────────────────
CURRENT_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))   # ai-service/
DATA_DIR     = os.path.join(PROJECT_ROOT, "data")

# CSV của từng brand — tất cả đều được đọc và gộp lại trước khi xử lý
INPUT_CSVS = {
    "mazda":      os.path.join(DATA_DIR, "raw", "car_details", "mazda_full_dataset.csv"),
    "ford":       os.path.join(DATA_DIR, "raw", "car_details", "ford_full_dataset.csv"),
    "toyota":     os.path.join(DATA_DIR, "raw", "car_details", "toyota_full_dataset.csv"),
    "hyundai":    os.path.join(DATA_DIR, "raw", "car_details", "hyundai_full_dataset.csv"),
    "mitsubishi": os.path.join(DATA_DIR, "raw", "car_details", "mitsubishi_full_dataset.csv"),
}

# Thư mục ảnh gốc theo brand (đã đổi tên raw_images → images_mazda)
IMG_BRAND_DIRS = {
    "mazda":      os.path.join(DATA_DIR, "raw", "images_mazda"),
    "ford":       os.path.join(DATA_DIR, "raw", "images_ford"),
    "toyota":     os.path.join(DATA_DIR, "raw", "images_toyota"),
    "hyundai":    os.path.join(DATA_DIR, "raw", "images_hyundai"),
    "mitsubishi": os.path.join(DATA_DIR, "raw", "images_mitsubishi"),
}

PROCESSED_DIR     = os.path.join(DATA_DIR, "processed")
PROCESSED_IMG_DIR = os.path.join(PROCESSED_DIR, "images")
OUTPUT_CSV        = os.path.join(PROCESSED_DIR, "final_dataset.csv")

os.makedirs(PROCESSED_IMG_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# ─── Hyperparameters ─────────────────────────────────────────────────────────
IMG_SIZE    = (224, 224)
MAX_IMGS    = 18
MIN_IMAGES  = 1

PRICE_MIN   = 50        # triệu VND
PRICE_MAX   = 5_000     # triệu VND
YEAR_MIN    = 1995
ODO_MAX     = 500_000   # km

IQR_FACTOR  = 1.5
ZSCORE_THR  = 3.0       # loại nếu |z| > 3 trong nhóm
MIN_GROUP   = 3

TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10
RANDOM_SEED = 42

# ─── Logger ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# TEXT / FEATURE NORMALIZATION
# ═══════════════════════════════════════════════════════════════════════════════

def extract_color(text: str) -> str:
    if not isinstance(text, str):
        return "Khác"
    t = text.lower()
    color_map = {
        "trắng": "Trắng", "đen": "Đen",   "đỏ": "Đỏ",
        "bạc":   "Bạc",   "xanh": "Xanh", "xám": "Xám",
        "vàng":  "Vàng",  "nâu":  "Nâu",  "cam": "Cam",
        "tím":   "Tím",   "hồng": "Hồng",
    }
    for kw, color in color_map.items():
        if kw in t:
            return color
    return "Khác"


def extract_single_owner(text: str) -> bool:
    if not isinstance(text, str):
        return False
    keywords = ["chính chủ", "1 chủ", "một chủ", "từ đầu", "một đời chủ"]
    return any(kw in text.lower() for kw in keywords)


def clean_description(text: str) -> str:
    if not isinstance(text, str):
        return "Unknown"
    text = re.sub(r"https?://\S+|www\.\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\d{3,4}[.\s]?\d{3}[.\s]?\d{3,4}", "", text)   # xoá số ĐT/giá
    text = re.sub(r"[^\w\s,.\-\/]", "", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip()
    return text if text else "Unknown"


def normalize_version(version_raw, title: str, description: str) -> str:
    if isinstance(version_raw, str) and version_raw.strip() not in ("", "N/A", "nan", "Unknown"):
        return version_raw.strip()
    corpus = f"{title or ''} {description or ''}".lower()
    parts  = []

    # Dung tích động cơ
    engine = re.search(r"(1\.0|1\.2|1\.5|1\.6|2\.0|2\.2|2\.4|2\.5|2\.8|3\.0)", corpus)
    if engine:
        parts.append(engine.group(1))

    # Phiên bản / trim
    for pat, label in [
        (r"signature",          "Signature"),
        (r"premium",            "Premium"),
        (r"luxury",             "Luxury"),
        (r"deluxe",             "Deluxe"),
        (r"sport",              "Sport"),
        (r"titanium",           "Titanium"),   # Ford
        (r"ambiente",           "Ambiente"),   # Ford/Toyota
        (r"trend",              "Trend"),       # Ford
        (r"ecoboost",           "EcoBoost"),    # Ford
        (r"bi.turbo",           "Bi-Turbo"),   # Ford Ranger
        (r"wildtrak",           "Wildtrak"),   # Ford Ranger
        (r"raptor",             "Raptor"),     # Ford Ranger
        (r"e\.?vi\.?t",        "E-vit"),       # Toyota Vios
        (r"g\b",                "G"),           # Toyota/Hyundai base
        (r"gls",                "GLS"),         # Hyundai
        (r"gl\b",               "GL"),          # Hyundai/Mitsubishi
        (r"gla",                "GLA"),
        (r"at\b|tự động",       "AT"),
        (r"mt\b|số sàn",        "MT"),
    ]:
        if re.search(pat, corpus):
            parts.append(label)
            break

    return " ".join(parts) if parts else "Unknown"


def normalize_body_type(body_raw, model: str) -> str:
    if isinstance(body_raw, str) and body_raw.strip() not in ("", "nan", "Unknown", "N/A"):
        return body_raw.strip()
    model_body = {
        # ── Mazda ──────────────────────────────────────────
        "Mazda 2":  "Hatchback",
        "Mazda 3":  "Sedan",
        "Mazda 6":  "Sedan",
        "CX-3":     "SUV",
        "CX-5":     "SUV",
        "CX-8":     "SUV",
        "CX-30":    "SUV",
        "CX-50":    "SUV",
        "BT-50":    "Bán tải",
        # ── Ford ───────────────────────────────────────────
        "Ford EcoSport":  "SUV",
        "Ford Escape":    "SUV",
        "Ford Explorer":  "SUV",
        "Ford Everest":   "SUV",
        "Ford Ranger":    "Bán tải",
        "Ford Territory": "SUV",
        "Ford Focus":     "Sedan",
        "Ford Fiesta":    "Hatchback",
        "Ford Mondeo":    "Sedan",
        "Ford Transit":   "Van",
        # ── Toyota ─────────────────────────────────────────
        "Toyota Vios":      "Sedan",
        "Toyota Corolla":   "Sedan",
        "Toyota Camry":     "Sedan",
        "Toyota Yaris":     "Hatchback",
        "Toyota Fortuner":  "SUV",
        "Toyota Innova":    "MPV",
        "Toyota Rush":      "SUV",
        "Toyota Hilux":     "Bán tải",
        "Toyota Prado":     "SUV",
        "Toyota Land Cruiser": "SUV",
        "Toyota Veloz":     "MPV",
        "Toyota Raize":     "SUV",
        # ── Hyundai ────────────────────────────────────────
        "Hyundai Grand i10":  "Hatchback",
        "Hyundai Accent":     "Sedan",
        "Hyundai Elantra":    "Sedan",
        "Hyundai Tucson":     "SUV",
        "Hyundai Santa Fe":   "SUV",
        "Hyundai Creta":      "SUV",
        "Hyundai i20":        "Hatchback",
        "Hyundai Kona":       "SUV",
        "Hyundai Stargazer":  "MPV",
        # ── Mitsubishi ─────────────────────────────────────
        "Mitsubishi Xpander":  "MPV",
        "Mitsubishi Outlander": "SUV",
        "Mitsubishi Attrage":  "Sedan",
        "Mitsubishi Mirage":   "Hatchback",
        "Mitsubishi Pajero":   "SUV",
        "Mitsubishi Triton":   "Bán tải",
        "Mitsubishi Eclipse Cross": "SUV",
        "Mitsubishi Galant":   "Sedan",
    }
    return model_body.get(str(model).strip(), "Unknown")


def normalize_seats(seats_raw, model: str) -> int:
    try:
        val = int(float(str(seats_raw).replace("chỗ", "").strip()))
        if val in (2, 4, 5, 6, 7, 8, 9):
            return val
    except (ValueError, TypeError, AttributeError):
        pass
    seats_map = {
        # ── Mazda ──────────────────────────
        "Mazda 2": 5, "Mazda 3": 5, "Mazda 6": 5,
        "CX-3": 5,   "CX-5": 5,   "CX-30": 5,  "CX-50": 5,
        "CX-8": 7,   "BT-50": 5,
        # ── Ford ───────────────────────────
        "Ford EcoSport": 5, "Ford Escape": 5,   "Ford Explorer": 7,
        "Ford Everest": 7,  "Ford Ranger": 5,   "Ford Territory": 5,
        "Ford Focus": 5,    "Ford Fiesta": 5,   "Ford Mondeo": 5,
        "Ford Transit": 9,
        # ── Toyota ─────────────────────────
        "Toyota Vios": 5,     "Toyota Corolla": 5,  "Toyota Camry": 5,
        "Toyota Yaris": 5,    "Toyota Fortuner": 7, "Toyota Innova": 7,
        "Toyota Rush": 7,     "Toyota Hilux": 5,    "Toyota Prado": 7,
        "Toyota Land Cruiser": 8, "Toyota Veloz": 7, "Toyota Raize": 5,
        # ── Hyundai ────────────────────────
        "Hyundai Grand i10": 5, "Hyundai Accent": 5, "Hyundai Elantra": 5,
        "Hyundai Tucson": 5,    "Hyundai Santa Fe": 7, "Hyundai Creta": 5,
        "Hyundai i20": 5,       "Hyundai Kona": 5,   "Hyundai Stargazer": 7,
        # ── Mitsubishi ─────────────────────
        "Mitsubishi Xpander": 7,  "Mitsubishi Outlander": 5,
        "Mitsubishi Attrage": 5,  "Mitsubishi Mirage": 5,
        "Mitsubishi Pajero": 7,   "Mitsubishi Triton": 5,
        "Mitsubishi Eclipse Cross": 5, "Mitsubishi Galant": 5,
    }
    return seats_map.get(str(model).strip(), 5)


def normalize_origin(origin_raw) -> str:
    if not isinstance(origin_raw, str):
        return "Khác"
    valid = {"Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Đài Loan", "Trung Quốc"}
    val   = origin_raw.strip()
    return val if val in valid else "Khác"


# Default dung tích theo model khi không parse được từ text
_MODEL_CAPACITY_DEFAULT: dict[str, float] = {
    # Mazda
    "Mazda 2": 1.5,  "Mazda 3": 2.0, "Mazda 6": 2.5,
    "CX-3": 1.5,     "CX-5": 2.0,    "CX-8": 2.5,
    "CX-30": 2.0,    "CX-50": 2.5,   "BT-50": 3.2,
    # Ford
    "Ford Ranger": 2.2,    "Ford Everest": 2.0,  "Ford Explorer": 2.3,
    "Ford EcoSport": 1.5,  "Ford Escape": 1.5,   "Ford Territory": 1.5,
    "Ford Focus": 1.5,     "Ford Fiesta": 1.5,   "Ford Mondeo": 2.0,
    "Ford Transit": 2.4,
    # Toyota
    "Toyota Vios": 1.5,      "Toyota Corolla": 1.8,  "Toyota Camry": 2.5,
    "Toyota Yaris": 1.5,     "Toyota Fortuner": 2.4, "Toyota Innova": 2.0,
    "Toyota Rush": 1.5,      "Toyota Hilux": 2.4,    "Toyota Prado": 3.0,
    "Toyota Land Cruiser": 4.0, "Toyota Veloz": 1.5, "Toyota Raize": 1.0,
    # Hyundai
    "Hyundai Grand i10": 1.2,  "Hyundai Accent": 1.4,   "Hyundai Elantra": 2.0,
    "Hyundai Tucson": 2.0,     "Hyundai Santa Fe": 2.2,  "Hyundai Creta": 1.5,
    "Hyundai i20": 1.4,        "Hyundai Kona": 2.0,     "Hyundai Stargazer": 1.5,
    # Mitsubishi
    "Mitsubishi Xpander": 1.5,    "Mitsubishi Outlander": 2.4,
    "Mitsubishi Attrage": 1.2,    "Mitsubishi Mirage": 1.2,
    "Mitsubishi Pajero": 3.0,     "Mitsubishi Triton": 2.4,
    "Mitsubishi Eclipse Cross": 1.5, "Mitsubishi Galant": 2.4,
}


def extract_capacity(text_raw, version_raw, model: str = "") -> float:
    corpus = f"{text_raw} {version_raw}".lower()
    # Tìm dung tích từ text (ưu tiên trước)
    m = re.search(r"(1\.0|1\.2|1\.4|1\.5|1\.6|1\.8|2\.0|2\.2|2\.4|2\.5|2\.8|3\.0|3\.2|4\.0)", corpus)
    if m:
        return float(m.group(1))
    # Fallback theo model
    return _MODEL_CAPACITY_DEFAULT.get(str(model).strip(), 2.0)


def normalize_drivetrain(dt_raw) -> str:
    if not isinstance(dt_raw, str) or dt_raw.lower() in ("nan", "unknown", "n/a", ""):
        return "FWD"
    val = dt_raw.upper()
    if any(x in val for x in ("AWD", "4WD", "2 CẦU")):
        return "AWD"
    if any(x in val for x in ("RWD", "CẦU SAU")):
        return "RWD"
    return "FWD"


def normalize_airbags(airbags_raw) -> int:
    try:
        return min(max(int(float(str(airbags_raw))), 0), 10)
    except Exception:
        return 6


# ═══════════════════════════════════════════════════════════════════════════════
# ODO PARSING
# ═══════════════════════════════════════════════════════════════════════════════

def _parse_odo(val) -> float:
    """Chuẩn hoá odo về đơn vị km (float)."""
    if pd.isna(val):
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).lower().strip()
    if "vạn" in s:
        try:
            return float(re.findall(r"[\d.]+", s)[0]) * 10_000
        except (IndexError, ValueError):
            pass
    try:
        return float(re.sub(r"[^\d.]", "", s))
    except ValueError:
        return 0.0


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGE PROCESSING
# ═══════════════════════════════════════════════════════════════════════════════

def _resolve_img_src(folder_name: str) -> str | None:
    """Tìm thư mục ảnh gốc của folder_name trong tất cả brand dirs."""
    for brand_dir in IMG_BRAND_DIRS.values():
        path = os.path.join(brand_dir, str(folder_name))
        if os.path.isdir(path):
            return path
    return None


def process_images(folder_name: str) -> int:
    """Resize & copy ảnh; trả về số ảnh hợp lệ đã lưu."""
    src_path = _resolve_img_src(folder_name)
    if src_path is None:
        logger.debug(f"Không tìm thấy thư mục ảnh: {folder_name}")
        return 0

    img_files = sorted([
        f for f in os.listdir(src_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ])
    if not img_files:
        return 0

    dst_path = os.path.join(PROCESSED_IMG_DIR, str(folder_name))
    os.makedirs(dst_path, exist_ok=True)

    saved = 0
    for i, fname in enumerate(img_files[:MAX_IMGS]):
        src_file = os.path.join(src_path, fname)
        try:
            img = cv2.imread(src_file)
            if img is None:
                with open(src_file, "rb") as fh:
                    arr = np.frombuffer(fh.read(), dtype=np.uint8)
                img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img is None or img.size == 0:
                continue
            resized  = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)
            dst_file = os.path.join(dst_path, f"img_{i:03d}.jpg")
            if cv2.imwrite(dst_file, resized, [cv2.IMWRITE_JPEG_QUALITY, 90]):
                saved += 1
        except Exception as exc:
            logger.debug(f"Lỗi ảnh {src_file}: {exc}")
    return saved


# ═══════════════════════════════════════════════════════════════════════════════
# OUTLIER FILTER
# ═══════════════════════════════════════════════════════════════════════════════

def _iqr_filter(series: pd.Series, factor: float = IQR_FACTOR) -> pd.Series:
    Q1, Q3 = series.quantile(0.25), series.quantile(0.75)
    IQR = Q3 - Q1
    return series.between(Q1 - factor * IQR, Q3 + factor * IQR)


def _zscore_filter(series: pd.Series, thr: float = ZSCORE_THR) -> pd.Series:
    mu, sigma = series.mean(), series.std(ddof=0)
    if sigma == 0:
        return pd.Series(True, index=series.index)
    return ((series - mu) / sigma).abs() <= thr


def filter_price_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Lọc outlier giá theo (model, year) dùng IQR + Z-score kép."""
    frames = []
    for (mdl, yr), grp in df.groupby(["model", "year"]):
        if len(grp) < MIN_GROUP:
            frames.append(grp)
            continue
        mask_iqr = _iqr_filter(grp["price_million"])
        mask_z   = _zscore_filter(grp["price_million"])
        frames.append(grp[mask_iqr & mask_z])
    return pd.concat(frames, ignore_index=True)


def filter_odo_price_paradox(df: pd.DataFrame) -> pd.DataFrame:
    """Loại bỏ mẫu: odo cao bất thường nhưng giá vẫn cao (nghịch lý kinh tế)."""
    frames = []
    for (mdl, yr), grp in df.groupby(["model", "year"]):
        if len(grp) < 5:
            frames.append(grp)
            continue
        med_price = grp["price_million"].median()
        med_odo   = grp["odo"].median()
        # Giá > 120% median nhưng odo > 150% median → nghi ngờ
        paradox = (grp["price_million"] > med_price * 1.2) & (grp["odo"] > med_odo * 1.5)
        frames.append(grp[~paradox])
    return pd.concat(frames, ignore_index=True)


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def _log_drop(label: str, before: int, after: int) -> None:
    logger.info(f"  [{label}] Còn {after:,} dòng  (loại {before - after:,})")


def clean_and_prepare_csv() -> None:
    # ── 1. Load & gộp tất cả brand CSV ───────────────────────────────────────
    frames_raw: list[pd.DataFrame] = []
    for brand, csv_path in INPUT_CSVS.items():
        if not os.path.exists(csv_path):
            logger.warning(f"  [{brand}] Không tìm thấy: {csv_path} — bỏ qua")
            continue
        tmp = pd.read_csv(csv_path, engine="python", on_bad_lines="skip")
        tmp["_brand"] = brand   # đánh dấu nguồn để debug
        frames_raw.append(tmp)
        logger.info(f"  [{brand:12s}] Đọc {len(tmp):,} dòng")

    if not frames_raw:
        logger.error("Không đọc được bất kỳ file CSV nào!")
        return

    df    = pd.concat(frames_raw, ignore_index=True)
    total = len(df)
    logger.info(f"Tổng dòng sau khi gộp: {total:,}  ({df['_brand'].value_counts().to_dict()})")

    # ── 2. Bỏ cột không cần ──────────────────────────────────────────────────
    df = df.drop(columns=["warranty"], errors="ignore")

    # ── 3. Ép kiểu số ────────────────────────────────────────────────────────
    for col in ("price_million", "year", "odo"):
        df[col] = pd.to_numeric(df.get(col), errors="coerce")

    # ── 4. Bỏ dòng thiếu giá / năm ───────────────────────────────────────────
    n = len(df)
    df = df.dropna(subset=["price_million", "year"])
    _log_drop("Thiếu price/year", n, len(df))

    # ── 5. Lọc khoảng giá toàn cục ───────────────────────────────────────────
    n = len(df)
    df = df[(df["price_million"] >= PRICE_MIN) & (df["price_million"] <= PRICE_MAX)]
    _log_drop(f"Giá ngoài [{PRICE_MIN}, {PRICE_MAX}] triệu", n, len(df))

    # ── 6. Năm sản xuất hợp lệ ───────────────────────────────────────────────
    current_year = datetime.now().year
    df["year"] = df["year"].astype(int)
    n = len(df)
    df = df[(df["year"] >= YEAR_MIN) & (df["year"] <= current_year)]
    _log_drop(f"Năm ngoài [{YEAR_MIN}, {current_year}]", n, len(df))

    # ── 7. Chuẩn hoá ODO ─────────────────────────────────────────────────────
    df["odo"] = df["odo"].apply(_parse_odo)

    # Nếu giá trị nhỏ hơn 1 000 → nhập thiếu đơn vị (ví dụ 80 → 80 000 km)
    small_mask = df["odo"] < 1_000
    df.loc[small_mask, "odo"] = df.loc[small_mask, "odo"] * 1_000

    # Odo = 0 sau parse → ước tính từ tuổi xe (12 000 km/năm)
    zero_mask = df["odo"] < 1_000
    df.loc[zero_mask, "odo"] = (
        (current_year - df.loc[zero_mask, "year"]).clip(lower=1) * 12_000
    )

    n = len(df)
    df = df[df["odo"] <= ODO_MAX]
    _log_drop(f"ODO > {ODO_MAX:,} km", n, len(df))

    # ── 8. Chỉ giữ xe đã qua sử dụng ────────────────────────────────────────
    n = len(df)
    df = df[df["condition"].fillna("Đã sử dụng").str.strip() != "Mới"]
    _log_drop("Xe mới", n, len(df))

    # ── 9. Bỏ dòng trùng lặp hoàn toàn ──────────────────────────────────────
    n = len(df)
    df = df.drop_duplicates()
    _log_drop("Dòng trùng lặp", n, len(df))

    # ── 10. Làm sạch và trích xuất đặc trưng text ────────────────────────────
    df["description"] = df.get("description", pd.Series(dtype=str)).apply(clean_description)

    corpus = df["title"].fillna("") + " " + df["description"].fillna("")
    df["exterior_color"]  = corpus.apply(extract_color)
    df["is_single_owner"] = corpus.apply(extract_single_owner)

    df["version_extracted"] = df.apply(
        lambda r: normalize_version(r.get("version"), r.get("title", ""), r.get("description", "")),
        axis=1,
    )
    df["body_type_clean"]  = df.apply(lambda r: normalize_body_type(r.get("body_type"), r.get("model", "")), axis=1)
    df["seats_clean"]      = df.apply(lambda r: normalize_seats(r.get("seats"), r.get("model", "")), axis=1)
    df["origin_clean"]     = df.get("origin", pd.Series(dtype=str)).apply(normalize_origin)
    df["gearbox"]          = df.get("gearbox", pd.Series(dtype=str)).fillna("Tự động")
    df["fuel"]             = df.get("fuel",    pd.Series(dtype=str)).fillna("Xăng")
    df["engine_capacity"]  = df.apply(
        lambda r: extract_capacity(r.get("title", ""), r.get("version_extracted", ""), r.get("model", "")),
        axis=1,
    )
    df["drivetrain_clean"] = df.get("drivetrain", pd.Series(dtype=str)).apply(normalize_drivetrain)
    df["airbags_clean"]    = df.get("airbags",    pd.Series(dtype=int)).apply(normalize_airbags)

    # ── 11. Lọc outlier giá theo (model, year) ───────────────────────────────
    logger.info("Lọc outlier giá (IQR + Z-score) theo nhóm (model, year)...")
    n = len(df)
    df = filter_price_outliers(df)
    _log_drop("Outlier giá IQR+Zscore", n, len(df))

    # ── 12. Lọc nghịch lý odo cao – giá cao ──────────────────────────────────
    logger.info("Lọc nghịch lý odo↑ nhưng giá↑ trong cùng nhóm...")
    n = len(df)
    df = filter_odo_price_paradox(df)
    _log_drop("Nghịch lý odo–giá", n, len(df))

    # ── 13. Chọn cột cuối ────────────────────────────────────────────────────
    final_columns = [
        "_brand",
        "car_id", "model", "version_extracted", "year",
        "price_million", "odo", "gearbox", "fuel",
        "body_type_clean", "origin_clean", "exterior_color",
        "is_single_owner", "seats_clean",
        "engine_capacity", "drivetrain_clean", "airbags_clean",
        "image_folder", "description",
    ]
    df = df[[col for col in final_columns if col in df.columns]]
    df = df.fillna("Unknown")

    # ── 13.5. Fix ánh xạ tên thư mục ảnh cho Mazda ───────────────────────────
    # Trước đó ta đã đổi tên thư mục raw_images chứa ảnh Mazda từ car_pX... thành mazda_id_N_1778567400
    # Cần ánh xạ lại tên trong CSV để khớp với thư mục thực tế trên ổ cứng.
    mazda_mask = df["_brand"] == "mazda"
    if mazda_mask.any():
        mazda_folders_in_csv = df.loc[mazda_mask, "image_folder"].dropna().unique()
        # Sắp xếp các folder gốc để ánh xạ index N đúng như cách ta đã rename thư mục
        mazda_folders_sorted = sorted([str(f) for f in mazda_folders_in_csv])
        
        mazda_mapping = {}
        for i, old_name in enumerate(mazda_folders_sorted):
            mazda_mapping[old_name] = f"mazda_id_{i}_1778567400"
            
        df.loc[mazda_mask, "image_folder"] = df.loc[mazda_mask, "image_folder"].map(lambda x: mazda_mapping.get(str(x), x))
        logger.info(f"Đã ánh xạ tên thư mục ảnh cho {len(mazda_mapping)} xe Mazda.")

    # ── 14. Kiểm tra và xử lý ảnh ────────────────────────────────────────────
    if "image_folder" not in df.columns:
        logger.error("CSV thiếu cột 'image_folder'. Không thể lọc ảnh.")
        return

    logger.info("Xử lý và kiểm tra ảnh...")
    unique_folders = df["image_folder"].dropna().unique()
    logger.info(f"  Số thư mục ảnh cần kiểm tra: {len(unique_folders):,}")

    folder_img_count: dict[str, int] = {}
    for folder in unique_folders:
        folder_img_count[str(folder)] = process_images(str(folder))

    valid_folders = {f for f, cnt in folder_img_count.items() if cnt >= MIN_IMAGES}
    logger.info(f"  Thư mục hợp lệ (≥{MIN_IMAGES} ảnh): {len(valid_folders):,} / {len(unique_folders):,}")

    n = len(df)
    df = df[df["image_folder"].astype(str).isin(valid_folders)]
    _log_drop("Thiếu ảnh hợp lệ", n, len(df))

    # ── 15. Xuất kết quả ─────────────────────────────────────────────────────
    if df.empty:
        logger.warning("DataFrame rỗng sau khi lọc. Không xuất file.")
        return

    df = df.reset_index(drop=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    logger.info(f"Xuất {len(df):,} dòng → {OUTPUT_CSV}")

    # ── 16. Chia tập train / val / test ──────────────────────────────────────
    _split_dataset(df)

    # ── 17. Thống kê tóm tắt ─────────────────────────────────────────────────
    kept_pct = len(df) / total * 100 if total else 0
    logger.info("─── Tóm tắt ───────────────────────────────────────────────")
    logger.info(f"  Dòng ban đầu   : {total:,}")
    logger.info(f"  Dòng giữ lại   : {len(df):,}  ({kept_pct:.1f}%)")
    logger.info(f"  Số model       : {df['model'].nunique()}")
    logger.info(f"  Năm SX         : {df['year'].min()} – {df['year'].max()}")
    logger.info(f"  Giá (triệu)    : {df['price_million'].min():.0f} – {df['price_million'].max():.0f}")
    logger.info(f"  ODO trung bình : {df['odo'].mean():,.0f} km")
    logger.info("────────────────────────────────────────────────────────────")


# ═══════════════════════════════════════════════════════════════════════════════
# TRAIN / VAL / TEST SPLIT
# ═══════════════════════════════════════════════════════════════════════════════

def _split_dataset(df: pd.DataFrame) -> None:
    """
    Chia tập theo 2 tầng (stratified 2-level):
      Tầng 1: stratify theo _brand → đảm bảo mỗi brand xuất hiện trong cả 3 tập
      Tầng 2: trong mỗi brand, stratify theo model nếu đủ mẫu
    Kết quả: val/test chắc chắn có đủ 5 brand.
    """
    logger.info("Chia tập train / val / test (stratify 2 tầng: brand → model)...")
    n = len(df)

    # ── Tầng 1: Đảm bảo đủ brand ──────────────────────────────────────────────
    # Thêm cột brand tạm nếu chưa có (lấy từ _brand hoặc parse từ model)
    if "_brand" not in df.columns:
        def _infer_brand(model: str) -> str:
            m = str(model).lower()
            if "ford"       in m: return "ford"
            if "toyota"     in m: return "toyota"
            if "hyundai"    in m: return "hyundai"
            if "mitsubishi" in m: return "mitsubishi"
            return "mazda"
        df = df.copy()
        df["_brand"] = df["model"].apply(_infer_brand)

    brand_counts = df["_brand"].value_counts()
    logger.info(f"  Phân bố brand: {brand_counts.to_dict()}")

    # Mỗi brand cần tối thiểu 3 mẫu để split
    rare_brands = brand_counts[brand_counts < 3].index.tolist()
    if rare_brands:
        logger.warning(f"  Brand quá ít mẫu (< 3): {rare_brands} → không đảm bảo xuất hiện trong mọi tập")

    # ── Chia theo brand trước ─────────────────────────────────────────────────
    can_stratify_brand = brand_counts.min() >= 3
    strat_brand = df["_brand"] if can_stratify_brand else None

    df_train_val, df_test = train_test_split(
        df, test_size=TEST_RATIO, random_state=RANDOM_SEED, stratify=strat_brand,
    )

    val_relative = VAL_RATIO / (1.0 - TEST_RATIO)
    strat_tv = df_train_val["_brand"] if can_stratify_brand else None
    df_train, df_val = train_test_split(
        df_train_val, test_size=round(val_relative, 6), random_state=RANDOM_SEED, stratify=strat_tv,
    )

    # ── Log phân bố brand trong từng tập ─────────────────────────────────────
    splits = {"train": df_train, "val": df_val, "test": df_test}
    for split_name, split_df in splits.items():
        out_path = os.path.join(PROCESSED_DIR, f"{split_name}.csv")
        split_df.to_csv(out_path, index=False, encoding="utf-8-sig")
        brand_dist = split_df["_brand"].value_counts().to_dict()
        logger.info(
            f"  [{split_name:5s}] {len(split_df):,} dòng ({len(split_df)/n*100:.1f}%)  "
            f"brand={brand_dist}  → {out_path}"
        )

    # ── Kiểm tra đủ 5 brand trong val/test ───────────────────────────────────
    all_brands = set(df["_brand"].unique())
    for split_name, split_df in [("val", df_val), ("test", df_test)]:
        missing = all_brands - set(split_df["_brand"].unique())
        if missing:
            logger.warning(f"  ⚠ [{split_name}] Thiếu brand: {missing} — cân nhắc tăng dữ liệu brand đó")
        else:
            logger.info(f"  ✓ [{split_name}] Có đủ {len(all_brands)} brand")

    logger.info(f"  Tổng kiểm tra: {len(df_train)+len(df_val)+len(df_test):,} / {n:,} ✓")


if __name__ == "__main__":
    clean_and_prepare_csv()