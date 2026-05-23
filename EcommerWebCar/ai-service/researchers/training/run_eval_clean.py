import os
import sys

# 1. Disable GPU and import TensorFlow FIRST to avoid library initialization deadlocks
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
try:
    tf.config.set_visible_devices([], 'GPU')
except Exception:
    pass

# 2. Import other libraries
import json
import logging
import numpy as np
import pandas as pd
import cv2

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick

from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(os.path.dirname(CURRENT_DIR))

DATA_DIR   = os.path.join(ROOT_DIR, "data", "processed")
IMG_DIR    = os.path.join(DATA_DIR, "images")
TRAIN_CSV  = os.path.join(DATA_DIR, "train.csv")
TEST_CSV   = os.path.join(DATA_DIR, "test.csv")
MODEL_PATH = os.path.join(ROOT_DIR, "researchers", "model", "car_price_model1.keras")
OUT_DIR    = os.path.join(CURRENT_DIR, "evaluation_output")

os.makedirs(OUT_DIR, exist_ok=True)

CAT_COLUMNS = [
    "_brand", "model", "version_extracted", "gearbox", "fuel",
    "body_type_clean", "origin_clean", "exterior_color", "drivetrain_clean"
]
CURRENT_YEAR = 2025

def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["car_age"] = (CURRENT_YEAR - df["year"]).clip(lower=0)
    df["log_odo"] = np.log1p(df["odo"].clip(lower=0))
    return df

def load_image(folder_name):
    img_path = os.path.join(IMG_DIR, str(folder_name), "img_000.jpg")
    img = cv2.imread(img_path)
    if img is not None:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img.astype("float32") / 255.0
    return np.full((224, 224, 3), 0.5, dtype="float32")

def load_images(df):
    imgs = np.zeros((len(df), 224, 224, 3), dtype="float32")
    for i, folder in enumerate(df["image_folder"]):
        imgs[i] = load_image(folder)
    return imgs

def encode_metadata(df, encoders, scaler):
    parts = []
    for col in CAT_COLUMNS:
        le: LabelEncoder = encoders[col]
        known = set(le.classes_)
        safe  = df[col].astype(str).apply(lambda v: v if v in known else le.classes_[0])
        enc   = le.transform(safe)
        mx    = len(le.classes_) - 1
        norm  = enc / (mx + 1e-7) if mx > 0 else enc.astype(float)
        parts.append(norm.reshape(-1, 1))

    parts.append((df["is_single_owner"].astype(int).values / 1.0).reshape(-1, 1))
    parts.append((df["seats_clean"].values / 8.0).reshape(-1, 1))
    parts.append((df["engine_capacity"].values / 5.0).reshape(-1, 1))
    parts.append((df["airbags_clean"].values / 10.0).reshape(-1, 1))

    numeric = df[["year", "odo", "car_age", "log_odo"]].values
    scaled  = scaler.transform(numeric)
    return np.hstack([scaled] + parts).astype("float32")

def compute_metrics(y_true, y_pred):
    errors = y_pred - y_true
    pct_errors = np.abs(errors) / y_true * 100
    mae = np.mean(np.abs(errors))
    rmse = np.sqrt(np.mean(errors ** 2))
    mape = np.mean(pct_errors)
    
    y_mean = np.mean(y_true)
    ss_tot = np.sum((y_true - y_mean) ** 2)
    ss_res = np.sum(errors ** 2)
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    under_10 = np.sum(pct_errors < 10) / len(y_true) * 100
    under_20 = np.sum(pct_errors < 20) / len(y_true) * 100

    return {
        "MAE_trieu_VND": float(mae),
        "RMSE_trieu_VND": float(rmse),
        "MAPE_percent": float(mape),
        "R2_score": float(r2),
        "Ti_le_du_doan_sai_so_under_10pct": float(under_10),
        "Ti_le_du_doan_sai_so_under_20pct": float(under_20)
    }

def main():
    log.info("=== BẮT ĐẦU ĐÁNH GIÁ MODEL TRÊN 5 HÃNG XE ===")
    df_train = engineer(pd.read_csv(TRAIN_CSV))
    df_test  = engineer(pd.read_csv(TEST_CSV))

    log.info("Fit encoders/scaler...")
    encoders = {}
    for col in CAT_COLUMNS:
        le = LabelEncoder()
        le.fit(df_train[col].astype(str))
        encoders[col] = le

    scaler = MinMaxScaler()
    scaler.fit(df_train[["year", "odo", "car_age", "log_odo"]].values)

    tfidf = TfidfVectorizer(max_features=100)
    tfidf.fit(df_train["description"].fillna("xe"))

    log.info("Transforming features...")
    meta_test = encode_metadata(df_test, encoders, scaler)
    text_test = tfidf.transform(df_test["description"].fillna("xe")).toarray().astype("float32")
    img_test = load_images(df_test)

    log.info("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)

    log.info("Predicting (CPU, batch_size=8)...")
    pred_log = model.predict([img_test, meta_test, text_test], batch_size=8, verbose=0).reshape(-1)

    y_pred_million = np.expm1(pred_log)
    y_true_million = df_test["price_million"].values.astype("float64")

    m = compute_metrics(y_true_million, y_pred_million)
    log.info(f"MAE: {m['MAE_trieu_VND']:.2f} | MAPE: {m['MAPE_percent']:.2f}% | R2: {m['R2_score']:.4f}")

    # Save metrics JSON
    metrics_path = os.path.join(OUT_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(m, f, indent=4, ensure_ascii=False)
    log.info(f"Đã lưu metrics: {metrics_path}")

    # Plot 1: Scatter True vs Pred
    plt.figure(figsize=(8, 8))
    plt.scatter(y_true_million, y_pred_million, alpha=0.6, color="#4C72B0", edgecolors="w", s=40)
    max_val = max(y_true_million.max(), y_pred_million.max())
    plt.plot([0, max_val], [0, max_val], 'r--', lw=2, label="Đường lý tưởng (y=x)")
    plt.title("Giá Trị Thực Tế vs Dự Đoán (5 Hãng Xe)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Giá thực tế (triệu VNĐ)", fontsize=12)
    plt.ylabel("Giá dự đoán (triệu VNĐ)", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "scatter_true_vs_pred.png"), dpi=150)
    plt.close()

    # Plot 2: Phân phối sai số
    plt.figure(figsize=(10, 6))
    errors = y_pred_million - y_true_million
    plt.hist(errors, bins=40, color="#C44E52", alpha=0.85, edgecolor="black", linewidth=0.5)
    plt.axvline(0, color="blue", linestyle="dashed", linewidth=1.5, label="Sai số = 0")
    plt.title("Phân Phối Sai Số Dự Đoán (5 Hãng Xe)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Sai lệch (Giá dự đoán - Giá thực tế) [triệu VNĐ]", fontsize=12)
    plt.ylabel("Số lượng tin đăng", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "error_distribution.png"), dpi=150)
    plt.close()

    # Plot 3: MAE theo model xe
    err_abs = np.abs(errors)
    df_err = pd.DataFrame({"model": df_test["model"].values, "abs_err": err_abs})
    grouped = df_err.groupby("model")["abs_err"].median().sort_values()
    top_models = df_test["model"].value_counts().head(20).index
    grouped_top = grouped[grouped.index.isin(top_models)]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.barh(grouped_top.index, grouped_top.values, color="#55A868", alpha=0.85, edgecolor="black", height=0.6)
    ax.set_title("Sai Số MAE Trung Vị Theo Các Dòng Xe Phổ Biến Nhất", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Sai số trung vị (triệu VNĐ)", fontsize=12)
    ax.set_ylabel("Dòng xe", fontsize=12)
    plt.grid(True, axis="x", linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "mae_by_car_model.png"), dpi=150)
    plt.close()

    # Plot 4: MAPE theo khoảng giá
    buckets = [0, 300, 500, 800, 1200, 2000, 5000]
    labels = ["Under 300M", "300M-500M", "500M-800M", "800M-1.2B", "1.2B-2B", "Above 2B"]
    df_bucket = pd.DataFrame({"true": y_true_million, "pct_err": np.abs(errors) / y_true_million * 100})
    df_bucket["price_range"] = pd.cut(df_bucket["true"], bins=buckets, labels=labels)
    grouped_bucket = df_bucket.groupby("price_range", observed=False)["pct_err"].mean()

    plt.figure(figsize=(10, 6))
    bars = plt.bar(grouped_bucket.index, grouped_bucket.values, color="#8172B3", alpha=0.85, edgecolor="black", width=0.5)
    plt.title("Sai Số MAPE (%) Theo Khoảng Giá Xe (5 Hãng Xe)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Khoảng giá thực tế", fontsize=12)
    plt.ylabel("Sai số phần trăm trung bình (MAPE) %", fontsize=12)
    for bar in bars:
        h = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., h + 1, f"{h:.1f}%", ha="center", va="bottom", fontweight="semibold")
    plt.gca().yaxis.set_major_formatter(mtick.PercentFormatter())
    plt.grid(True, axis="y", linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "mape_by_price_range.png"), dpi=150)
    plt.close()

    log.info("=== ĐÁNH GIÁ HOÀN TẤT! ===")

if __name__ == "__main__":
    main()
