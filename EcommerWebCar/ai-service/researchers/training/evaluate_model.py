import os
import sys
import json
import numpy as np
import pandas as pd
import cv2
import joblib
import logging
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
VAL_CSV    = os.path.join(DATA_DIR, "val.csv")
TEST_CSV   = os.path.join(DATA_DIR, "test.csv")
MODEL_PATH = os.path.join(ROOT_DIR, "researchers", "model", "car_price_model1.keras")
OUT_DIR    = os.path.join(CURRENT_DIR, "evaluation_output")
os.makedirs(OUT_DIR, exist_ok=True)

CAT_COLUMNS = [
    "model", "version_extracted", "gearbox", "fuel",
    "body_type_clean", "origin_clean", "exterior_color", "drivetrain_clean"
]
CURRENT_YEAR = 2025


def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["car_age"] = (CURRENT_YEAR - df["year"]).clip(lower=0)
    df["log_odo"] = np.log1p(df["odo"].clip(lower=0))
    return df


def load_image(folder_name: str) -> np.ndarray:
    for fname in ("img_000.jpg", "img_0.jpg", "img_00.jpg"):
        p = os.path.join(IMG_DIR, str(folder_name), fname)
        img = cv2.imread(p)
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            return img.astype("float32") / 255.0
    return np.full((224, 224, 3), 0.5, dtype="float32")


def load_images(df: pd.DataFrame) -> np.ndarray:
    imgs = np.zeros((len(df), 224, 224, 3), dtype="float32")
    missing = 0
    for i, folder in enumerate(df["image_folder"]):
        result = load_image(folder)
        imgs[i] = result
        if result.mean() == 0.5:
            missing += 1
    if missing > 0:
        log.warning(f"  {missing}/{len(df)} mẫu thiếu ảnh → dùng ảnh xám mặc định")
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
    
    # New features
    parts.append((df["engine_capacity"].values / 5.0).reshape(-1, 1))
    parts.append((df["airbags_clean"].values / 10.0).reshape(-1, 1))

    numeric = df[["year", "odo", "car_age", "log_odo"]].values
    scaled  = scaler.transform(numeric)
    return np.hstack([scaled] + parts).astype("float32")


def compute_metrics(y_true, y_pred):
    err  = y_pred - y_true
    mae  = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err**2)))
    mask = np.abs(y_true) > 1e-6
    mape = float(np.mean(np.abs(err[mask] / y_true[mask])) * 100)
    r2   = float(1 - np.sum(err**2) / np.sum((y_true - y_true.mean())**2))
    within10 = float(np.mean(np.abs(err / (y_true + 1e-6)) <= 0.10) * 100)
    within20 = float(np.mean(np.abs(err / (y_true + 1e-6)) <= 0.20) * 100)
    return {
        "MAE_trieu_VND": round(mae, 2),
        "RMSE_trieu_VND": round(rmse, 2),
        "MAPE_percent": round(mape, 2),
        "R2_score": round(r2, 4),
        "Ti_le_du_doan_sai_so_under_10pct": round(within10, 2),
        "Ti_le_du_doan_sai_so_under_20pct": round(within20, 2),
    }


def plot_scatter(y_true, y_pred, path):
    fig, ax = plt.subplots(figsize=(7, 7))
    ax.scatter(y_true, y_pred, alpha=0.35, s=15, color="#4C72B0", zorder=2)
    lim = [min(y_true.min(), y_pred.min()) * 0.9, max(y_true.max(), y_pred.max()) * 1.05]
    ax.plot(lim, lim, "r--", lw=1.5, label="y = x (hoàn hảo)", zorder=3)
    ax.set_xlim(lim); ax.set_ylim(lim)
    ax.set_xlabel("Giá thực tế (triệu VND)", fontsize=12)
    ax.set_ylabel("Giá dự đoán (triệu VND)", fontsize=12)
    ax.set_title("Thực tế vs Dự đoán (tập Test)", fontsize=14, fontweight="bold")
    ax.legend(); ax.grid(alpha=0.3)
    plt.tight_layout(); plt.savefig(path, dpi=150); plt.close()
    log.info(f"  Đã lưu: {path}")


def plot_error_dist(y_true, y_pred, path):
    err = y_pred - y_true
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.hist(err, bins=40, color="#4C72B0", edgecolor="white", alpha=0.85)
    ax.axvline(0, color="red", linewidth=1.5, linestyle="--", label="Sai số = 0")
    ax.axvline(err.mean(), color="orange", linewidth=1.5, linestyle="-",
               label=f"Trung bình = {err.mean():.1f}M")
    ax.set_xlabel("Sai số (triệu VND): dự đoán − thực tế", fontsize=11)
    ax.set_ylabel("Số mẫu", fontsize=11)
    ax.set_title("Phân bố sai số trên tập Test", fontsize=13, fontweight="bold")
    ax.legend(); ax.grid(alpha=0.2)
    plt.tight_layout(); plt.savefig(path, dpi=150); plt.close()
    log.info(f"  Đã lưu: {path}")


def plot_error_by_model(y_true, y_pred, car_models, path):
    err_abs = np.abs(y_pred - y_true)
    df_err = pd.DataFrame({"model": car_models, "abs_err": err_abs})
    grouped = df_err.groupby("model")["abs_err"].median().sort_values()

    fig, ax = plt.subplots(figsize=(10, max(4, len(grouped) * 0.45)))
    bars = ax.barh(grouped.index, grouped.values, color="#4C72B0", alpha=0.85)
    ax.bar_label(bars, fmt="%.0f M", padding=3, fontsize=9)
    ax.set_xlabel("MAE trung vị (triệu VND)", fontsize=11)
    ax.set_title("Sai số tuyệt đối trung vị theo dòng xe", fontsize=13, fontweight="bold")
    ax.grid(axis="x", alpha=0.3)
    plt.tight_layout(); plt.savefig(path, dpi=150, bbox_inches="tight"); plt.close()
    log.info(f"  Đã lưu: {path}")


def plot_pct_error_by_bucket(y_true, y_pred, path):
    """Chia giá theo khoảng và tính MAPE từng nhóm."""
    pct_err = np.abs((y_pred - y_true) / (y_true + 1e-6)) * 100
    bins = [0, 200, 400, 600, 800, 1000, 2000, 5000]
    labels = ["<200", "200-400", "400-600", "600-800", "800-1000", "1000-2000", ">2000"]
    bucket = pd.cut(y_true, bins=bins, labels=labels)
    df_b = pd.DataFrame({"bucket": bucket, "pct_err": pct_err})
    grouped = df_b.groupby("bucket", observed=True)["pct_err"].median()

    fig, ax = plt.subplots(figsize=(9, 4))
    bars = ax.bar(grouped.index, grouped.values, color="#4C72B0", alpha=0.85, edgecolor="white")
    ax.bar_label(bars, fmt="%.1f%%", padding=2, fontsize=9)
    ax.set_xlabel("Khoảng giá (triệu VND)", fontsize=11)
    ax.set_ylabel("MAPE trung vị (%)", fontsize=11)
    ax.set_title("Sai số tương đối theo khoảng giá", fontsize=13, fontweight="bold")
    ax.grid(axis="y", alpha=0.25)
    plt.tight_layout(); plt.savefig(path, dpi=150); plt.close()
    log.info(f"  Đã lưu: {path}")


def main():
    import tensorflow as tf

    # Kiểm tra file
    for p in (TRAIN_CSV, VAL_CSV, TEST_CSV, MODEL_PATH):
        if not os.path.exists(p):
            log.error(f"Không tìm thấy: {p}")
            sys.exit(1)

    log.info("=== BẮT ĐẦU ĐÁNH GIÁ MODEL ===")

    df_train = engineer(pd.read_csv(TRAIN_CSV))
    df_val   = engineer(pd.read_csv(VAL_CSV))
    df_test  = engineer(pd.read_csv(TEST_CSV))

    log.info(f"Kích thước: Train={len(df_train)} | Val={len(df_val)} | Test={len(df_test)}")

    log.info("Fit encoders/scaler trên train...")
    encoders = {}
    for col in CAT_COLUMNS:
        le = LabelEncoder()
        le.fit(df_train[col].astype(str))
        encoders[col] = le

    scaler = MinMaxScaler()
    scaler.fit(df_train[["year", "odo", "car_age", "log_odo"]].values)

    tfidf = TfidfVectorizer(max_features=100)
    tfidf.fit(df_train["description"].fillna("xe đẹp nguyên bản"))

    log.info("Transform features...")
    meta_test = encode_metadata(df_test, encoders, scaler)
    text_test = tfidf.transform(df_test["description"].fillna("xe đẹp nguyên bản")).toarray().astype("float32")

    log.info(f"Meta shape: {meta_test.shape} | Text shape: {text_test.shape}")

    log.info("Load ảnh test set...")
    img_test = load_images(df_test)

    log.info(f"Load model: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    log.info("Model loaded!")

    pred_log = model.predict([img_test, meta_test, text_test], verbose=1).reshape(-1)

    y_pred_million = np.expm1(pred_log)
    y_true_million = df_test["price_million"].values.astype("float64")

    m = compute_metrics(y_true_million, y_pred_million)

    n_total = len(df_train) + len(df_val) + len(df_test)
    summary = {
        "=== THÔNG TIN TẬP DỮ LIỆU ===": "",
        "n_total": n_total,
        "n_train": len(df_train),
        "n_val": len(df_val),
        "n_test": len(df_test),
        "price_range_trieu": {
            "min": float(df_test["price_million"].min()),
            "max": float(df_test["price_million"].max()),
            "median": float(df_test["price_million"].median()),
        },
        "=== THÔNG SỐ MODEL ===": "",
        "architecture": "EfficientNetB0 (frozen) + Metadata (16 feat) + TF-IDF (100 feat)",
        "target": "log1p(price_million) — học trong log-space",
        "optimizer": "Adam lr=3e-4",
        "loss_fn": "Huber(delta=0.5)",
        "epochs_max": 200,
        "patience_early_stop": 25,
        "dropout": "0.5 (img), 0.3 (meta), 0.3 (text), 0.4 (fusion)",
        "l2_reg": "1e-4",
        "batch_size": 16,
        "NOTE_train_val_gap": (
            "Train MAE >> Val MAE là hiện tượng bình thường với Dropout+BatchNorm. "
            "Dropout inflate Train MAE; Inference mode cho Val MAE thực. "
            "Đây KHÔNG phải overfitting hay data leakage."
        ),
        "=== KẾT QUẢ ĐÁNH GIÁ (tập Test) ===": "",
        **m,
    }

    print("\n" + "="*60)
    print("      KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH DỰ ĐOÁN GIÁ XE MAZDA")
    print("="*60)
    print(f"   Tổng mẫu       : {n_total:,}")
    print(f"   Train           : {len(df_train):,} ({len(df_train)/n_total*100:.0f}%)")
    print(f"   Validation      : {len(df_val):,}  ({len(df_val)/n_total*100:.0f}%)")
    print(f"   Test            : {len(df_test):,}  ({len(df_test)/n_total*100:.0f}%)")
    print(f"\n   Khoảng giá test : {y_true_million.min():.0f} – {y_true_million.max():.0f} triệu VND")
    print(f"   Giá trung vị    : {np.median(y_true_million):.0f} triệu VND")

    print(f"\n📈 Kết quả trên tập Test:")
    print(f"   MAE  (lệch tuyệt đối TB) : {m['MAE_trieu_VND']:.1f} triệu VND")
    print(f"   RMSE                     : {m['RMSE_trieu_VND']:.1f} triệu VND")
    print(f"   MAPE (lệch % TB)         : {m['MAPE_percent']:.1f}%")
    print(f"   R² Score                 : {m['R2_score']:.4f}")
    print(f"   Dự đoán sai số ≤ 10%     : {m['Ti_le_du_doan_sai_so_under_10pct']:.1f}%")
    print(f"   Dự đoán sai số ≤ 20%     : {m['Ti_le_du_doan_sai_so_under_20pct']:.1f}%")

    # Đánh giá chất lượng
    mape = m["MAPE_percent"]
    if mape < 10:
        grade = "Xuất sắc"
    elif mape < 15:
        grade = "Tốt"
    elif mape < 25:
        grade = "Trung bình"
    else:
        grade = "Cần cải thiện"
    print(f"\n   Đánh giá tổng thể : {grade} (MAPE = {mape:.1f}%)")

    print(f"\n Sai số theo dòng xe (test set):")
    err_abs = np.abs(y_pred_million - y_true_million)
    df_res = df_test.copy()
    df_res["abs_err"] = err_abs
    df_res["pct_err"] = np.abs((y_pred_million - y_true_million) / (y_true_million + 1e-6)) * 100
    by_model = df_res.groupby("model").agg(
        n=("abs_err", "count"),
        MAE=("abs_err", "mean"),
        MAPE=("pct_err", "mean"),
    ).round(1)
    print(by_model.to_string())
    print("="*60)

    json_path = os.path.join(OUT_DIR, "model_metrics.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    log.info(f"\n Đã lưu metrics → {json_path}")

    xgb_path = os.path.join(OUT_DIR, "baseline_xgboost_metrics.json")
    if os.path.exists(xgb_path):
        with open(xgb_path, encoding="utf-8") as f:
            xgb_m = json.load(f)
        # Naive baseline (median)
        median_pred = np.full_like(y_true_million, np.median(y_true_million))
        naive_err   = np.abs(median_pred - y_true_million)
        naive_mape  = float(np.mean(naive_err / (y_true_million + 1e-6)) * 100)
        naive_r2    = float(1 - np.sum((median_pred - y_true_million)**2)
                            / np.sum((y_true_million - y_true_million.mean())**2))
        print("\n" + "="*70)
        print("  BẢNG SO SÁNH CÁC PHƯƠNG PHÁP (tập Test)")
        print(f"  {'Mô hình':<38} {'MAE':>8} {'MAPE':>8} {'R²':>8}")
        print("-"*70)
        print(f"  {'Naive Baseline (đoán median giá)':<38}"
              f" {np.mean(naive_err):>7.1f}M {naive_mape:>7.1f}% {naive_r2:>8.4f}")
        print(f"  {'XGBoost (tabular-only)':<38}"
              f" {xgb_m['MAE_trieu_VND']:>7.1f}M "
              f"{xgb_m['MAPE_percent']:>7.1f}% "
              f"{xgb_m['R2_score']:>8.4f}")
        print(f"  {'Multimodal (Ảnh + Metadata + Text)':<38}"
              f" {m['MAE_trieu_VND']:>7.1f}M "
              f"{m['MAPE_percent']:>7.1f}% "
              f"{m['R2_score']:>8.4f}")
        print("="*70)
        # Tính % cải thiện so với XGBoost
        imp_mae  = (xgb_m['MAE_trieu_VND']  - m['MAE_trieu_VND'])  / xgb_m['MAE_trieu_VND']  * 100
        imp_mape = (xgb_m['MAPE_percent']   - m['MAPE_percent'])   / xgb_m['MAPE_percent']   * 100
        if imp_mae > 0:
            print(f"  Multimodal cải thiện MAE  so với XGBoost: {imp_mae:.1f}%")
            print(f"  Multimodal cải thiện MAPE so với XGBoost: {imp_mape:.1f}%")
        else:
            print(f"   XGBoost tabular tốt hơn Multimodal MAE: {-imp_mae:.1f}%")
            print("     → Gợi ý: unfreeze CNN hoặc thu thập thêm ảnh chất lượng cao")
    else:
        print("\n💡 Chạy baseline_xgboost.py để có bảng so sánh đầy đủ cho KLTN")

    # Vẽ biểu đồ
    log.info("\nVẽ biểu đồ...")
    plot_scatter(y_true_million, y_pred_million,
                 os.path.join(OUT_DIR, "scatter_true_vs_pred.png"))

    plot_error_dist(y_true_million, y_pred_million,
                    os.path.join(OUT_DIR, "error_distribution.png"))

    plot_error_by_model(y_true_million, y_pred_million,
                        df_test["model"].values,
                        os.path.join(OUT_DIR, "mae_by_car_model.png"))

    plot_pct_error_by_bucket(y_true_million, y_pred_million,
                             os.path.join(OUT_DIR, "mape_by_price_range.png"))

    log.info(f"\n Hoàn thành! Tất cả kết quả lưu tại: {OUT_DIR}")


if __name__ == "__main__":
    main()
