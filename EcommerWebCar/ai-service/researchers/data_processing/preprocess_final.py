import os
import cv2
import pandas as pd
import numpy as np
import re
from datetime import datetime
import logging
from sklearn.model_selection import train_test_split

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

IMG_SIZE    = (224, 224)  
MAX_IMGS    = 18          
MIN_IMAGES  = 1           
PRICE_MIN   = 50          
PRICE_MAX   = 5_000       
IQR_FACTOR  = 1.5         
MIN_GROUP   = 3           

TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
TEST_RATIO  = 0.10
RANDOM_SEED = 42
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)



def extract_color(text: str) -> str:
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
    if not isinstance(text, str):
        return False
    keywords = ["chính chủ", "1 chủ", "một chủ", "từ đầu", "một đời chủ"]
    return any(kw in text.lower() for kw in keywords)


def clean_description(text: str) -> str:
    if not isinstance(text, str):
        return "Unknown"

    text = re.sub(r"[^\w\s,.\-\/]", "", text, flags=re.UNICODE)
    text = re.sub(r"https?://\S+|www\.\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\d{3,4}[.\s]?\d{3}[.\s]?\d{3,4}", "", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text if text else "Unknown"


def normalize_version(version_raw, title: str, description: str) -> str:
    if isinstance(version_raw, str) and version_raw.strip() not in ("", "N/A", "nan", "Unknown"):
        return version_raw.strip()

    corpus = f"{title or ''} {description or ''}".lower()
    parts  = []

    engine = re.search(r"(1\.2|1\.5|1\.6|2\.0|2\.2|2\.5|3\.0)", corpus)
    if engine:
        parts.append(engine.group(1))

    if   re.search(r"signature",          corpus): parts.append("Signature")
    elif re.search(r"premium",            corpus): parts.append("Premium")
    elif re.search(r"luxury",             corpus): parts.append("Luxury")
    elif re.search(r"deluxe",             corpus): parts.append("Deluxe")
    elif re.search(r"sport",              corpus): parts.append("Sport")
    elif re.search(r"tự động|at\b",       corpus): parts.append("AT")
    elif re.search(r"số sàn|\bmt\b",      corpus): parts.append("MT")

    return " ".join(parts) if parts else "Unknown"


def normalize_body_type(body_raw, model: str) -> str:
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
    try:
        val = int(float(str(seats_raw).replace("chỗ", "").strip()))
        if val in (2, 4, 5, 6, 7, 8, 9):
            return val
    except (ValueError, TypeError, AttributeError):
        pass

    seats_map = {"CX-8": 7, "BT-50": 5, "Mazda 6": 5, "Mazda 3": 5, "Mazda 2": 5, "CX-5": 5, "CX-3": 5}
    return seats_map.get(str(model).strip(), 5)


def normalize_origin(origin_raw) -> str:
    if not isinstance(origin_raw, str):
        return "Khác"
    val   = origin_raw.strip()
    valid = {"Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Đài Loan", "Trung Quốc"}
    return val if val in valid else "Khác"

def extract_capacity(text_raw, version_raw) -> float:
    corpus = f"{text_raw} {version_raw}".lower()
    match = re.search(r"(1\.2|1\.5|1\.6|2\.0|2\.2|2\.5|3\.0)", corpus)
    if match:
        return float(match.group(1))
    return 2.0  

def normalize_drivetrain(dt_raw) -> str:
    if not isinstance(dt_raw, str) or dt_raw.lower() in ("nan", "unknown", "n/a", ""):
        return "FWD" 
    val = dt_raw.upper()
    if "AWD" in val or "4WD" in val or "2 CẦU" in val: return "AWD"
    if "RWD" in val or "CẦU SAU" in val: return "RWD"
    return "FWD"

def normalize_airbags(airbags_raw) -> int:
    try:
        val = int(float(str(airbags_raw)))
        return min(max(val, 0), 10)
    except:
        return 6 # Default Mazda đời mới thường 6 túi khí



def process_images(folder_name: str) -> int:
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



def _log_drop(label: str, before: int, after: int) -> None:
    logger.info(f"  [{label}] Còn {after:,} dòng  (loại {before - after:,})")


def clean_and_prepare_csv() -> None:
    # 1. Load 
    if not os.path.exists(INPUT_CSV):
        logger.error(f"Không tìm thấy file CSV: {INPUT_CSV}")
        return

    logger.info(f"Đọc file: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV, engine="python", on_bad_lines="skip")
    logger.info(f"  (Các dòng lỗi format trong CSV sẽ tự động bị bỏ qua)")
    total = len(df)
    logger.info(f"Tổng dòng ban đầu: {total:,}")

    # 2. Bỏ cột không cần 
    df = df.drop(columns=["warranty"], errors="ignore")

    # 3. Ép kiểu số 
    for col in ("price_million", "year", "odo"):
        df[col] = pd.to_numeric(df.get(col), errors="coerce")

    # 4. Bỏ dòng thiếu giá / năm 
    n = len(df)
    df = df.dropna(subset=["price_million", "year"])
    _log_drop("Thiếu price/year", n, len(df))

    # 5. Lọc giá bất thường toàn cục 
    n = len(df)
    df = df[(df["price_million"] >= PRICE_MIN) & (df["price_million"] <= PRICE_MAX)]
    _log_drop(f"Giá ngoài [{PRICE_MIN}, {PRICE_MAX}] triệu", n, len(df))

    # 6. Ép kiểu year thành int 
    df["year"] = df["year"].astype(int)
    current_year = datetime.now().year
    n = len(df)
    df = df[(df["year"] >= 1995) & (df["year"] <= current_year)] # Mazda trước 1995 ở VN rất hiếm/nát
    _log_drop("Năm sản xuất không hợp lệ", n, len(df))

    # 7. Xử lý odo 
    # Xử lý odo chuỗi (ví dụ '9 vạn')
    def parse_odo_text(val):
        if pd.isna(val): return 0
        if isinstance(val, (int, float)): return float(val)
        s = str(val).lower()
        if 'vạn' in s:
            try: return float(re.findall(r'\d+', s)[0]) * 10000
            except: pass
        try: return float(re.sub(r'[^\d.]', '', s))
        except: return 0

    df["odo"] = df["odo"].apply(parse_odo_text)
    df.loc[df["odo"] < 1000, "odo"] = df["odo"] * 1_000 # Giả định nhập 80 là 80k km
    
    # Nếu odo quá nhỏ (< 1000) sau khi scale, có thể là xe lướt hoặc dữ liệu lỗi
    mask_zero = df["odo"] < 1000
    df.loc[mask_zero, "odo"] = (
        (current_year - df.loc[mask_zero, "year"]).clip(lower=1) * 12_000 # Hạ xuống 12k/năm cho chuẩn hơn
    )
    
    n = len(df)
    df = df[df["odo"] <= 500_000]
    _log_drop("odo > 500 000 km", n, len(df))

    # 8. Chỉ giữ xe đã qua sử dụng 
    n = len(df)
    df = df[df["condition"].fillna("Đã sử dụng").str.strip() != "Mới"]
    _log_drop("Xe mới", n, len(df))

    # 9. Làm sạch mô tả 
    df["description"] = df.get("description", pd.Series(dtype=str)).apply(clean_description)

    # 10. Trích xuất đặc trưng từ text 
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
    
    # --- Features Mới ---
    df["engine_capacity"] = df.apply(lambda r: extract_capacity(r.get("title", ""), r.get("version_extracted", "")), axis=1)
    df["drivetrain_clean"] = df.get("drivetrain", pd.Series(dtype=str)).apply(normalize_drivetrain)
    df["airbags_clean"]   = df.get("airbags", pd.Series(dtype=int)).apply(normalize_airbags)

    # 11. Lọc outlier giá theo (model, year) 
    logger.info("Lọc outlier giá theo nhóm (model, year)...")
    frames = []
    for (mdl, yr), group in df.groupby(["model", "year"]):
        if len(group) >= MIN_GROUP:
            Q1  = group["price_million"].quantile(0.25)
            Q3  = group["price_million"].quantile(0.75)
            IQR = Q3 - Q1
            lo, hi = Q1 - IQR_FACTOR * IQR, Q3 + IQR_FACTOR * IQR
            mask = group["price_million"].between(lo, hi)
            
            # Thêm một bước lọc quan trọng: Nếu odo tỷ lệ thuận với giá quá mức trong nhóm (sai logic kinh tế)
            # Chúng ta chỉ loại bỏ những mẫu quá vô lý
            group_clean = group[mask]
            if len(group_clean) >= 5:
                # Tính correlation đơn giản
                corr = group_clean[['odo', 'price_million']].corr().iloc[0, 1]
                if corr > 0.7: 
                    # Nếu odo và price tỷ lệ thuận quá mạnh (>0.7), loại bỏ bớt các mẫu cao giá mà cao odo
                    median_price = group_clean['price_million'].median()
                    median_odo = group_clean['odo'].median()
                    group_clean = group_clean[~((group_clean['price_million'] > median_price) & (group_clean['odo'] > median_odo * 1.5))]

            frames.append(group_clean)
        else:
            frames.append(group)

    n = len(df)
    df = pd.concat(frames, ignore_index=True)
    _log_drop("Outlier giá/odo vô lý", n, len(df))

    # 12. Chọn cột cuối 
    final_columns = [
        "car_id", "model", "version_extracted", "year",
        "price_million", "odo", "gearbox", "fuel",
        "body_type_clean", "origin_clean", "exterior_color",
        "is_single_owner", "seats_clean",
        "engine_capacity", "drivetrain_clean", "airbags_clean",
        "image_folder", "description",
    ]
    df = df[[col for col in final_columns if col in df.columns]]
    df = df.fillna("Unknown")

    # 13. Kiểm tra image_folder tồn tại 
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

    # 14. Xuất kết quả 
    if df.empty:
        logger.warning("DataFrame rỗng sau khi lọc. Không xuất file.")
        return

    df = df.reset_index(drop=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    logger.info(f"Xuất {len(df):,} dòng → {OUTPUT_CSV}")

    # 15. Chia tập train / val / test 
    _split_dataset(df)

    # 16. Thống kê tóm tắt 
    kept_pct = len(df) / total * 100 if total else 0
    logger.info("─── Tóm tắt ───────────────────────────────────────")
    logger.info(f"  Dòng ban đầu  : {total:,}")
    logger.info(f"  Dòng giữ lại  : {len(df):,}  ({kept_pct:.1f}%)")
    logger.info(f"  Số model      : {df['model'].nunique()}")
    logger.info(f"  Năm           : {df['year'].min()} – {df['year'].max()}")
    logger.info(f"  Giá (triệu)   : {df['price_million'].min():.0f} – {df['price_million'].max():.0f}")
    logger.info("────────────────────────────────────────────────────")


def _split_dataset(df: pd.DataFrame) -> None:
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

    df_train_val, df_test = train_test_split(
        df,
        test_size=TEST_RATIO,       # 0.10
        random_state=RANDOM_SEED,
        stratify=strat_col,
    )


    val_relative = VAL_RATIO / (1.0 - TEST_RATIO)   # 0.1 / 0.9 ≈ 0.1111

    strat_tv = df_train_val["model"] if use_stratify else None
    df_train, df_val = train_test_split(
        df_train_val,
        test_size=round(val_relative, 6),
        random_state=RANDOM_SEED,
        stratify=strat_tv,
    )

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


if __name__ == "__main__":
    clean_and_prepare_csv()