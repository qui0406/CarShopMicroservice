"""
preprocess_final.py
───────────────────
Pipeline làm sạch dữ liệu CSV và xử lý ảnh xe Mazda trước khi đưa vào training.

Các bước chính:
  1. Đọc CSV thô, loại bỏ / vá các giá trị không hợp lệ
  2. Lọc outlier giá theo nhóm (model, year)
  3. Chuẩn hoá ảnh: resize → 224×224 px, bỏ qua ảnh corrupt / thiếu
  4. Chỉ giữ lại các dòng có ít nhất MIN_IMAGES ảnh hợp lệ
  5. Xuất CSV sạch ra processed/final_dataset.csv
  6. Chia tập train / val / test và lưu riêng
"""

import os
import cv2
import pandas as pd
import numpy as np
import re
from datetime import datetime
import logging
from sklearn.model_selection import train_test_split

# ─────────────────────────── Đường dẫn ───────────────────────────────────────
CURRENT_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR)) # ai-service/
DATA_DIR     = os.path.join(PROJECT_ROOT, "data")

INPUT_CSV     = os.path.join(DATA_DIR, "raw", "car_details", "mazda_full_dataset.csv")
INPUT_IMG_DIR = os.path.join(DATA_DIR, "raw", "raw_images")

PROCESSED_DIR     = os.path.join(DATA_DIR, "processed")
PROCESSED_IMG_DIR = os.path.join(PROCESSED_DIR, "images")
OUTPUT_CSV        = os.path.join(PROCESSED_DIR, "final_dataset.csv")

os.makedirs(PROCESSED_IMG_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# ─────────────────────────── Tham số ─────────────────────────────────────────
IMG_SIZE    = (224, 224)   # kích thước resize
MAX_IMGS    = 18           # tối đa ảnh mỗi xe
MIN_IMAGES  = 1            # tối thiểu ảnh hợp lệ để giữ dòng
PRICE_MIN   = 50           # triệu VND – dưới ngưỡng này coi là lỗi dữ liệu
PRICE_MAX   = 5_000        # triệu VND – trên ngưỡng này coi là lỗi dữ liệu
IQR_FACTOR  = 1.5          # hệ số IQR để phát hiện outlier
MIN_GROUP   = 3            # nhóm nhỏ hơn giá trị này → bỏ qua lọc outlier

# ─────── Tỷ lệ chia tập ──────────────────────────────────────────────────────
# train : val : test  =  80 : 10 : 10
TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10
RANDOM_SEED = 42

# ─────────────────────────── Logger ──────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ═════════════════════════ Các hàm trích xuất / chuẩn hoá ════════════════════

def extract_color(text: str) -> str:
    """Trích xuất màu xe từ chuỗi văn bản tiếng Việt."""
    if not isinstance(text, str):
        return "Khác"
    text = text.lower()
    color_map = {
        "trắng": "Trắng", "đen": "Đen",   "đỏ": "Đỏ",
        "bạc":   "Bạc",   "xanh": "Xanh", "xám": "Xám",
        "vàng":  "Vàng",  "nâu": "Nâu",   "cam": "Cam",
        "tím":   "Tím",   "hồng": "Hồng",
    }
    for keyword, color in color_map.items():
        if keyword in text:
            return color
    return "Khác"


def extract_single_owner(text: str) -> bool:
    """Phát hiện xe chính chủ từ tiêu đề / mô tả."""
    if not isinstance(text, str):
        return False
    keywords = ["chính chủ", "1 chủ", "một chủ", "từ đầu", "một đời chủ"]
    return any(kw in text.lower() for kw in keywords)


def clean_description(text: str) -> str:
    """
    Làm sạch mô tả:
      - Xoá emoji / ký tự đặc biệt
      - Xoá link website
      - Xoá số điện thoại
      - Chuẩn hoá khoảng trắng
    """
    if not isinstance(text, str):
        return "Unknown"

    text = re.sub(r"[^\w\s,.\-\/]", "", text, flags=re.UNICODE)
    text = re.sub(r"https?://\S+|www\.\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\d{3,4}[.\s]?\d{3}[.\s]?\d{3,4}", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text if text else "Unknown"


def normalize_version(version_raw, title: str, description: str) -> str:
    """
    Chuẩn hoá phiên bản xe:
      Ưu tiên giá trị có sẵn, nếu thiếu thì suy luận từ tiêu đề / mô tả.
    """
    if isinstance(version_raw, str) and version_raw.strip() not in ("", "N/A", "nan", "Unknown"):
        return version_raw.strip()

    corpus = f"{title or ''} {description or ''}".lower()
    parts  = []

    engine = re.search(r"(1\.5|2\.0|2\.5)", corpus)
    if engine:
        parts.append(engine.group(1))

    if   re.search(r"signature",          corpus): parts.append("Signature")
    elif re.search(r"premium",            corpus): parts.append("Premium")
    elif re.search(r"luxury",             corpus): parts.append("Luxury")
    elif re.search(r"deluxe",             corpus): parts.append("Deluxe")
    elif re.search(r"tự động|at\b",       corpus): parts.append("AT")
    elif re.search(r"số sàn|\bmt\b",      corpus): parts.append("MT")

    return " ".join(parts) if parts else "Unknown"


def normalize_body_type(body_raw, model: str) -> str:
    """Chuẩn hoá kiểu thân xe; suy luận từ model nếu thiếu."""
    if isinstance(body_raw, str) and body_raw.strip() not in ("", "nan", "Unknown", "N/A"):
        return body_raw.strip()

    model_body_map = {
        "Mazda 2": "Hatchback",
        "Mazda 3": "Sedan",
        "Mazda 6": "Sedan",
        "CX-3":    "SUV",
        "CX-5":    "SUV",
        "CX-8":    "SUV",
        "CX-30":   "SUV",
        "BT-50":   "Bán tải",
    }
    return model_body_map.get(str(model).strip(), "Unknown")


def normalize_seats(seats_raw, model: str) -> int:
    """Chuẩn hoá số chỗ ngồi; suy luận từ model nếu thiếu."""
    try:
        val = int(float(str(seats_raw)))
        if val in (2, 4, 5, 6, 7, 8):
            return val
    except (ValueError, TypeError):
        pass

    seats_map = {"CX-8": 7, "BT-50": 5}
    return seats_map.get(str(model).strip(), 5)


def normalize_origin(origin_raw) -> str:
    """Chuẩn hoá xuất xứ xe."""
    if not isinstance(origin_raw, str):
        return "Khác"
    val   = origin_raw.strip()
    valid = {"Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Đài Loan", "Trung Quốc"}
    return val if val in valid else "Khác"


# ═════════════════════════ Xử lý ảnh ════════════════════════════════════════

def process_images(folder_name: str) -> int:
    """
    Đọc ảnh thô, resize về IMG_SIZE và lưu vào PROCESSED_IMG_DIR.

    Returns:
        Số ảnh hợp lệ đã lưu (0 nếu thư mục không tồn tại hoặc không có ảnh đọc được).
    """
    src_path = os.path.join(INPUT_IMG_DIR, str(folder_name))
    dst_path = os.path.join(PROCESSED_IMG_DIR, str(folder_name))

    if not os.path.isdir(src_path):
        logger.debug(f"Không tìm thấy thư mục ảnh: {src_path}")
        return 0

    img_files = sorted([
        f for f in os.listdir(src_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ])

    if not img_files:
        logger.debug(f"Thư mục rỗng: {src_path}")
        return 0

    os.makedirs(dst_path, exist_ok=True)

    saved = 0
    for i, img_name in enumerate(img_files[:MAX_IMGS]):
        src_file = os.path.join(src_path, img_name)
        try:
            img = cv2.imread(src_file)
            if img is None:
                with open(src_file, "rb") as fh:
                    arr = np.frombuffer(fh.read(), dtype=np.uint8)
                img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

            if img is None or img.size == 0:
                logger.debug(f"Ảnh corrupt / rỗng: {src_file}")
                continue

            resized = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)
            dst_file = os.path.join(dst_path, f"img_{i:03d}.jpg")
            ok = cv2.imwrite(dst_file, resized, [cv2.IMWRITE_JPEG_QUALITY, 90])
            if ok:
                saved += 1
            else:
                logger.warning(f"Không ghi được ảnh: {dst_file}")

        except Exception as exc:
            logger.debug(f"Lỗi xử lý ảnh {src_file}: {exc}")
            continue

    logger.debug(f"[{folder_name}] {saved}/{len(img_files[:MAX_IMGS])} ảnh hợp lệ")
    return saved


# ═════════════════════════ Pipeline chính ════════════════════════════════════

def _log_drop(label: str, before: int, after: int) -> None:
    """Ghi log số dòng bị loại."""
    logger.info(f"  [{label}] Còn {after:,} dòng  (loại {before - after:,})")


def clean_and_prepare_csv() -> None:
    """
    Pipeline đầy đủ:
      load → validate → normalize → outlier filter → image filter → export
    """
    # ── 1. Load ──────────────────────────────────────────────────────────────
    if not os.path.exists(INPUT_CSV):
        logger.error(f"Không tìm thấy file CSV: {INPUT_CSV}")
        return

    logger.info(f"Đọc file: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV, engine="python", on_bad_lines="skip")
    logger.info(f"  (Các dòng lỗi format trong CSV sẽ tự động bị bỏ qua)")
    total = len(df)
    logger.info(f"Tổng dòng ban đầu: {total:,}")

    # ── 2. Bỏ cột không cần ─────────────────────────────────────────────────
    df = df.drop(columns=["warranty"], errors="ignore")

    # ── 3. Ép kiểu số ────────────────────────────────────────────────────────
    for col in ("price_million", "year", "odo"):
        df[col] = pd.to_numeric(df.get(col), errors="coerce")

    # ── 4. Bỏ dòng thiếu giá / năm ──────────────────────────────────────────
    n = len(df)
    df = df.dropna(subset=["price_million", "year"])
    _log_drop("Thiếu price/year", n, len(df))

    # ── 5. Lọc giá bất thường toàn cục ─────────────────────────────────────
    n = len(df)
    df = df[(df["price_million"] >= PRICE_MIN) & (df["price_million"] <= PRICE_MAX)]
    _log_drop(f"Giá ngoài [{PRICE_MIN}, {PRICE_MAX}] triệu", n, len(df))

    # ── 6. Ép kiểu year thành int ────────────────────────────────────────────
    df["year"] = df["year"].astype(int)
    current_year = datetime.now().year
    n = len(df)
    df = df[(df["year"] >= 1990) & (df["year"] <= current_year)]
    _log_drop("Năm sản xuất không hợp lệ", n, len(df))

    # ── 7. Xử lý odo ─────────────────────────────────────────────────────────
    df["odo"] = df["odo"].fillna(0)
    df.loc[df["odo"] < 500, "odo"] = df["odo"] * 1_000
    mask_zero = df["odo"] == 0
    df.loc[mask_zero, "odo"] = (
        (current_year - df.loc[mask_zero, "year"]).clip(lower=1) * 15_000
    )
    n = len(df)
    df = df[df["odo"] <= 500_000]
    _log_drop("odo > 500 000 km", n, len(df))

    # ── 8. Chỉ giữ xe đã qua sử dụng ────────────────────────────────────────
    n = len(df)
    df = df[df["condition"].fillna("Đã sử dụng").str.strip() != "Mới"]
    _log_drop("Xe mới", n, len(df))

    # ── 9. Làm sạch mô tả ────────────────────────────────────────────────────
    df["description"] = df.get("description", pd.Series(dtype=str)).apply(clean_description)

    # ── 10. Trích xuất đặc trưng từ text ─────────────────────────────────────
    corpus = df["title"].fillna("") + " " + df["description"].fillna("")
    df["exterior_color"]  = corpus.apply(extract_color)
    df["is_single_owner"] = corpus.apply(extract_single_owner)

    df["version_extracted"] = df.apply(
        lambda r: normalize_version(
            r.get("version"), r.get("title", ""), r.get("description", "")
        ),
        axis=1,
    )
    df["body_type_clean"] = df.apply(
        lambda r: normalize_body_type(r.get("body_type"), r.get("model", "")), axis=1
    )
    df["seats_clean"] = df.apply(
        lambda r: normalize_seats(r.get("seats"), r.get("model", "")), axis=1
    )
    df["origin_clean"] = df.get("origin", pd.Series(dtype=str)).apply(normalize_origin)
    df["gearbox"] = df.get("gearbox", pd.Series(dtype=str)).fillna("Tự động")
    df["fuel"]    = df.get("fuel",    pd.Series(dtype=str)).fillna("Xăng")

    # ── 11. Lọc outlier giá theo (model, year) ───────────────────────────────
    logger.info("Lọc outlier giá theo nhóm (model, year)...")
    frames = []
    for (mdl, yr), group in df.groupby(["model", "year"]):
        if len(group) >= MIN_GROUP:
            Q1  = group["price_million"].quantile(0.25)
            Q3  = group["price_million"].quantile(0.75)
            IQR = Q3 - Q1
            lo, hi = Q1 - IQR_FACTOR * IQR, Q3 + IQR_FACTOR * IQR
            mask = group["price_million"].between(lo, hi)
            frames.append(group[mask])
        else:
            frames.append(group)

    n = len(df)
    df = pd.concat(frames, ignore_index=True)
    _log_drop("Outlier giá (model, year)", n, len(df))

    # ── 12. Chọn cột cuối ────────────────────────────────────────────────────
    final_columns = [
        "car_id", "model", "version_extracted", "year",
        "price_million", "odo", "gearbox", "fuel",
        "body_type_clean", "origin_clean", "exterior_color",
        "is_single_owner", "seats_clean",
        "image_folder", "description",
    ]
    df = df[[col for col in final_columns if col in df.columns]]
    df = df.fillna("Unknown")

    # ── 13. Kiểm tra image_folder tồn tại ────────────────────────────────────
    if "image_folder" not in df.columns:
        logger.error("CSV thiếu cột 'image_folder'. Không thể lọc ảnh.")
        return

    logger.info("Xử lý và kiểm tra ảnh...")
    unique_folders = df["image_folder"].dropna().unique()
    logger.info(f"  Số thư mục ảnh cần kiểm tra: {len(unique_folders):,}")

    folder_img_count: dict[str, int] = {}
    for folder in unique_folders:
        count = process_images(str(folder))
        folder_img_count[str(folder)] = count

    valid_folders = {f for f, cnt in folder_img_count.items() if cnt >= MIN_IMAGES}
    logger.info(
        f"  Thư mục hợp lệ (≥{MIN_IMAGES} ảnh): {len(valid_folders):,} / {len(unique_folders):,}"
    )

    n = len(df)
    df = df[df["image_folder"].astype(str).isin(valid_folders)]
    _log_drop("Thiếu ảnh hợp lệ", n, len(df))

    # ── 14. Xuất kết quả ─────────────────────────────────────────────────────
    if df.empty:
        logger.warning("DataFrame rỗng sau khi lọc. Không xuất file.")
        return

    df = df.reset_index(drop=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    logger.info(f"Xuất {len(df):,} dòng → {OUTPUT_CSV}")

    # ── 15. Chia tập train / val / test ──────────────────────────────────────
    _split_dataset(df)

    # ── 16. Thống kê tóm tắt ─────────────────────────────────────────────────
    kept_pct = len(df) / total * 100 if total else 0
    logger.info("─── Tóm tắt ───────────────────────────────────────")
    logger.info(f"  Dòng ban đầu  : {total:,}")
    logger.info(f"  Dòng giữ lại  : {len(df):,}  ({kept_pct:.1f}%)")
    logger.info(f"  Số model      : {df['model'].nunique()}")
    logger.info(f"  Năm           : {df['year'].min()} – {df['year'].max()}")
    logger.info(f"  Giá (triệu)   : {df['price_million'].min():.0f} – {df['price_million'].max():.0f}")
    logger.info("────────────────────────────────────────────────────")


def _split_dataset(df: pd.DataFrame) -> None:
    """
    Chia df thành 3 tập train / val / test theo tỷ lệ 80 / 10 / 10.

    Chiến lược:
      - Bước 1: tách 10% làm test.
      - Bước 2: từ 90% còn lại, tách val chiếm 10/90 ≈ 11.11% → val = 10% tổng.
      - Dùng cột 'model' để stratify (giữ phân phối model đồng đều).
      - Nếu một model có quá ít mẫu để stratify → fallback về chia ngẫu nhiên.
      - Mỗi tập được lưu vào processed/train.csv, processed/val.csv, processed/test.csv.
    """
    logger.info("Chia tập train / val / test...")
    n = len(df)

    # Kiểm tra xem có thể stratify theo model không
    model_counts = df["model"].value_counts()
    min_count    = model_counts.min()
    use_stratify = min_count >= 3

    strat_col = df["model"] if use_stratify else None
    if not use_stratify:
        logger.warning(
            "  Một số model có < 3 mẫu → bỏ stratify, chia ngẫu nhiên."
        )

    # Bước 1: tách test (10% của toàn bộ)
    df_train_val, df_test = train_test_split(
        df,
        test_size=TEST_RATIO,       # 0.10
        random_state=RANDOM_SEED,
        stratify=strat_col,
    )

    # Bước 2: tách val từ phần còn lại (90%)
    # val chiếm 10% tổng → trong tập 90% thì val = 10/90 ≈ 0.1111
    val_relative = VAL_RATIO / (1.0 - TEST_RATIO)   # 0.1 / 0.9 ≈ 0.1111

    strat_tv = df_train_val["model"] if use_stratify else None
    df_train, df_val = train_test_split(
        df_train_val,
        test_size=round(val_relative, 6),
        random_state=RANDOM_SEED,
        stratify=strat_tv,
    )

    # Lưu file
    splits = {
        "train": df_train,
        "val":   df_val,
        "test":  df_test,
    }
    for split_name, split_df in splits.items():
        out_path = os.path.join(PROCESSED_DIR, f"{split_name}.csv")
        split_df.to_csv(out_path, index=False, encoding="utf-8-sig")
        pct = len(split_df) / n * 100
        logger.info(
            f"  [{split_name:5s}] {len(split_df):,} dòng ({pct:.1f}%)  → {out_path}"
        )

    logger.info(
        f"  Tổng kiểm tra: {len(df_train)+len(df_val)+len(df_test):,} / {n:,} ✓"
    )


# ─────────────────────────── Entry point ─────────────────────────────────────
if __name__ == "__main__":
    clean_and_prepare_csv()