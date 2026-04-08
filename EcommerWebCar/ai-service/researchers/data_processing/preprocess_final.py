import os
import cv2
import pandas as pd
import re
from datetime import datetime
import logging

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))
DATA_DIR     = os.path.join(PROJECT_ROOT, "data")

INPUT_CSV     = os.path.join(DATA_DIR, "raw", "car_details", "mazda_full_dataset.csv")
INPUT_IMG_DIR = os.path.join(DATA_DIR, "raw", "raw_images")

PROCESSED_DIR     = os.path.join(DATA_DIR, "processed")
PROCESSED_IMG_DIR = os.path.join(PROCESSED_DIR, "images")
OUTPUT_CSV        = os.path.join(PROCESSED_DIR, "final_dataset.csv")

os.makedirs(PROCESSED_IMG_DIR, exist_ok=True)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def extract_color(text: str) -> str:
    if not isinstance(text, str):
        return "Khác"
    text = text.lower()
    color_map = {
        "trắng": "Trắng", "đen": "Đen", "đỏ": "Đỏ",
        "bạc":   "Bạc",   "xanh": "Xanh", "xám": "Xám",
        "vàng":  "Vàng",  "nâu": "Nâu",   "cam": "Cam",
    }
    for keyword, color in color_map.items():
        if keyword in text:
            return color
    return "Khác"


def extract_single_owner(text: str) -> bool:
    if not isinstance(text, str):
        return False
    text = text.lower()
    keywords = ["chính chủ", "1 chủ", "một chủ", "từ đầu", "một đời chủ"]
    return any(kw in text for kw in keywords)


def normalize_version(version_raw, title: str, description: str) -> str:
    if isinstance(version_raw, str) and version_raw.strip() not in ("", "N/A", "nan", "Unknown"):
        return version_raw.strip()

    corpus = f"{title or ''} {description or ''}".lower()
    parts  = []

    engine = re.search(r"(1\.5|2\.0|2\.5)", corpus)
    if engine:
        parts.append(engine.group(1))

    if   re.search(r"signature",       corpus): parts.append("Signature")
    elif re.search(r"premium",         corpus): parts.append("Premium")
    elif re.search(r"luxury",          corpus): parts.append("Luxury")
    elif re.search(r"deluxe",          corpus): parts.append("Deluxe")
    elif re.search(r"tự động|at\b",    corpus): parts.append("AT")
    elif re.search(r"số sàn|\bmt\b",   corpus): parts.append("MT")

    return " ".join(parts) if parts else "Unknown"


def normalize_body_type(body_raw, model: str) -> str:
    if isinstance(body_raw, str) and body_raw.strip() not in ("", "nan", "Unknown"):
        return body_raw.strip()

    model_body_map = {
        "Mazda 2":    "Hatchback",
        "Mazda 3":    "Sedan",
        "Mazda 6":    "Sedan",
        "CX-3":       "SUV",
        "CX-5":       "SUV",
        "CX-8":       "SUV",
        "CX-30":      "SUV",
        "BT-50":      "Bán tải",
        "Mazda Other": "Unknown",
    }
    return model_body_map.get(str(model).strip(), "Unknown")


def normalize_seats(seats_raw, model: str) -> int:
    try:
        val = int(float(str(seats_raw)))
        if val in (4, 5, 6, 7, 8):
            return val
    except (ValueError, TypeError):
        pass

    seats_map = {"CX-8": 7, "BT-50": 5}
    return seats_map.get(str(model).strip(), 5)


def normalize_origin(origin_raw: str) -> str:
    if not isinstance(origin_raw, str):
        return "Khác"
    val = origin_raw.strip()
    valid = {"Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Đài Loan"}
    return val if val in valid else "Khác"


def process_images(folder_name: str) -> bool:
    src_path = os.path.join(INPUT_IMG_DIR, str(folder_name))
    dst_path = os.path.join(PROCESSED_IMG_DIR, str(folder_name))

    if not os.path.exists(src_path):
        logger.warning(f"Image not exsited: {src_path}")
        return False

    os.makedirs(dst_path, exist_ok=True)
    img_files = sorted([
        f for f in os.listdir(src_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ])

    saved = 0
    for i, img_name in enumerate(img_files[:18]):
        try:
            img = cv2.imread(os.path.join(src_path, img_name))
            if img is None:
                continue
            resized = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)
            cv2.imwrite(os.path.join(dst_path, f"img_{i}.jpg"), resized)
            saved += 1
        except Exception:
            continue

    return saved > 0


def clean_and_prepare_csv():
    if not os.path.exists(INPUT_CSV):
        logger.warning(f"Find not file CSV: {INPUT_CSV}")
        return

    df = pd.read_csv(INPUT_CSV)
    count_init = len(df)

    #Loai bo du lieu cua trang cho tot gan mac dinh bao duong= true --> khong tin cay duoc
    df = df.drop(columns=['warranty'], errors='ignore')

    df["price_million"] = pd.to_numeric(df["price_million"], errors="coerce")
    df["year"]          = pd.to_numeric(df["year"],          errors="coerce")
    df["odo"]           = pd.to_numeric(df["odo"],           errors="coerce")

    df = df.dropna(subset=["price_million", "year"])

    #Loai bo du lieu khong dang tin cay (gia xe duoi 20tr va tren 5 ty)
    df = df[(df["price_million"] > 20) & (df["price_million"] <= 5000)]


    #Chuan hoa du lieu do nguoi dung nhap sai
    current_year = datetime.now().year
    df["odo"] = df["odo"].fillna(0)
    df.loc[df["odo"] < 100, "odo"] = df["odo"] * 1000

    mask_zero = df["odo"] == 0
    df.loc[mask_zero, "odo"] = (
        (current_year - df.loc[mask_zero, "year"]).clip(lower=1) * 15_000
    )

    df = df[df["condition"].fillna("Đã sử dụng") != "Mới"]

    corpus = df["title"].fillna("") + " " + df["description"].fillna("")

    df["exterior_color"]  = corpus.apply(extract_color)
    df["is_single_owner"] = corpus.apply(extract_single_owner)

    df["version_extracted"] = df.apply(
        lambda r: normalize_version(r.get("version"), r.get("title", ""), r.get("description", "")),
        axis=1
    )


    df["body_type_clean"] = df.apply(
        lambda r: normalize_body_type(r.get("body_type"), r.get("model", "")), axis=1
    )
    df["seats_clean"] = df.apply(
        lambda r: normalize_seats(r.get("seats"), r.get("model", "")), axis=1
    )
    df["origin_clean"] = df["origin"].apply(normalize_origin)
    df["gearbox"]      = df["gearbox"].fillna("Tự động")
    df["fuel"]         = df["fuel"].fillna("Xăng")


    #Loc cac loai xe co gia bat thuong so voi cac xe cung loai
    frames = []
    for yr, group in df.groupby("year"):
        if len(group) > 5:
            Q1 = group["price_million"].quantile(0.25)
            Q3 = group["price_million"].quantile(0.75)
            IQR = Q3 - Q1
            mask = group["price_million"].between(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR)
            frames.append(group[mask])
        else:
            frames.append(group)

    df = pd.concat(frames, ignore_index=True)


    final_columns = [
        "car_id",
        "model",
        "version_extracted",
        "year",
        "price_million",
        "odo",
        "gearbox",
        "fuel",
        "body_type_clean",
        "origin_clean",
        "exterior_color",
        "is_single_owner",
        "seats_clean",
        "image_folder",
        "description"
    ]
    df = df[[col for col in final_columns if col in df.columns]]

    df = df.fillna("Unknown")

    valid_folders = [
        folder for folder in df["image_folder"].unique()
        if process_images(folder)
    ]
    df = df[df["image_folder"].isin(valid_folders)]


    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")


if __name__ == "__main__":
    clean_and_prepare_csv()