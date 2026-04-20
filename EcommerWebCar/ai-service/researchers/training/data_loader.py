import os
import cv2
import pandas as pd
import numpy as np
import joblib
import logging
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer

CURRENT_DIR = os.path.abspath(__file__)
ROOT_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))

DATA_DIR  = os.path.join(ROOT_DIR, "data", "processed")
IMG_DIR   = os.path.join(DATA_DIR, "images")

TRAIN_CSV = os.path.join(DATA_DIR, "train.csv")
VAL_CSV   = os.path.join(DATA_DIR, "val.csv")

MODEL_SAVE_DIR = os.path.join(ROOT_DIR, "model", "transformers")
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

logger = logging.getLogger(__name__)

CAT_COLUMNS = [
    'model', 'version_extracted', 'gearbox', 'fuel',
    'body_type_clean', 'origin_clean', 'exterior_color'
]

CURRENT_YEAR = 2025



def _engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["car_age"] = (CURRENT_YEAR - df["year"]).clip(lower=0)
    df["log_odo"] = np.log1p(df["odo"].clip(lower=0))
    return df


def _load_image(folder_name: str) -> np.ndarray:
    img_path = os.path.join(IMG_DIR, str(folder_name), "img_000.jpg")
    img = cv2.imread(img_path)
    if img is not None:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img.astype("float32") / 255.0
    logger.debug(f"Không tìm thấy ảnh: {img_path}")
    return np.full((224, 224, 3), 0.5, dtype="float32")


def _load_images(df: pd.DataFrame) -> np.ndarray:
    images = np.zeros((len(df), 224, 224, 3), dtype="float32")
    for i, folder_name in enumerate(df["image_folder"]):
        images[i] = _load_image(folder_name)
    return images


def _encode_metadata(df: pd.DataFrame,
                     encoders: dict,
                     scaler: MinMaxScaler) -> np.ndarray:
    encoded_features = []

    for col in CAT_COLUMNS:
        le: LabelEncoder = encoders[col]
        known = set(le.classes_)
        safe = df[col].astype(str).apply(
            lambda v: v if v in known else le.classes_[0]
        )
        encoded = le.transform(safe)
        max_val = len(le.classes_) - 1
        norm    = encoded / (max_val + 1e-7) if max_val > 0 else encoded.astype(float)
        encoded_features.append(norm.reshape(-1, 1))

    encoded_features.append((df["is_single_owner"].astype(int).values / 1.0).reshape(-1, 1))
    encoded_features.append((df["seats_clean"].values / 8.0).reshape(-1, 1))

    numeric = df[["year", "odo", "car_age", "log_odo"]].values
    scaled  = scaler.transform(numeric)

    return np.hstack([scaled] + encoded_features).astype("float32")


def _vectorize_text(df: pd.DataFrame, tfidf: TfidfVectorizer) -> np.ndarray:
    return tfidf.transform(
        df["description"].fillna("xe đẹp nguyên bản")
    ).toarray().astype("float32")


def load_multimodal_data():
    for path in (TRAIN_CSV, VAL_CSV):
        if not os.path.exists(path):
            logger.error(f"Không tìm thấy file: {path}")
            return None

    df_train = _engineer_features(pd.read_csv(TRAIN_CSV))
    df_val   = _engineer_features(pd.read_csv(VAL_CSV))

    logger.info(f"Train: {len(df_train)} mẫu | Val: {len(df_val)} mẫu")
    logger.info(
        f"Giá train (triệu): min={df_train['price_million'].min():.0f}"
        f"  max={df_train['price_million'].max():.0f}"
        f"  median={df_train['price_million'].median():.0f}"
    )

    encoders: dict[str, LabelEncoder] = {}
    for col in CAT_COLUMNS:
        le = LabelEncoder()
        le.fit(df_train[col].astype(str))
        encoders[col] = le
        joblib.dump(le, os.path.join(MODEL_SAVE_DIR, f"le_{col}.pkl"))

    scaler = MinMaxScaler()
    scaler.fit(df_train[["year", "odo", "car_age", "log_odo"]].values)
    joblib.dump(scaler, os.path.join(MODEL_SAVE_DIR, "scaler_numeric.pkl"))

    tfidf = TfidfVectorizer(max_features=100)
    tfidf.fit(df_train["description"].fillna("xe đẹp nguyên bản"))
    joblib.dump(tfidf, os.path.join(MODEL_SAVE_DIR, "tfidf_vectorizer.pkl"))

    meta_train = _encode_metadata(df_train, encoders, scaler)
    meta_val   = _encode_metadata(df_val,   encoders, scaler)

    text_train = _vectorize_text(df_train, tfidf)
    text_val   = _vectorize_text(df_val,   tfidf)

    imgs_train = _load_images(df_train)
    imgs_val   = _load_images(df_val)

    prices_train = np.log1p(df_train["price_million"].values).astype("float32")
    prices_val   = np.log1p(df_val["price_million"].values).astype("float32")

    logger.info(
        f"Meta features: {meta_train.shape[1]} | "
        f"Text features: {text_train.shape[1]}"
    )

    train_data = (imgs_train, meta_train, text_train, prices_train)
    val_data   = (imgs_val,   meta_val,   text_val,   prices_val)
    return train_data, val_data


if __name__ == "__main__":
    result = load_multimodal_data()
    if result:
        (imgs_t, meta_t, txt_t, p_t), (imgs_v, meta_v, txt_v, p_v) = result
        print(f"Train → imgs: {imgs_t.shape}  meta: {meta_t.shape}  text: {txt_t.shape}  prices: {p_t.shape}")
        print(f"Val   → imgs: {imgs_v.shape}  meta: {meta_v.shape}  text: {txt_v.shape}  prices: {p_v.shape}")
        # Kiểm tra log-space
        sample_price_log = p_t[:5]
        sample_price_ori = np.expm1(sample_price_log)
        print(f"Giá mẫu (log-space)  : {sample_price_log}")
        print(f"Giá mẫu (triệu VND)  : {sample_price_ori}")
