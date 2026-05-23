

from __future__ import annotations

import argparse
import json
import os
import sys

import cv2
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
sys.path.insert(0, ROOT_DIR)

DATA_DIR = os.path.join(ROOT_DIR, "data", "processed")
CSV_PATH = os.path.join(DATA_DIR, "final_dataset.csv")
IMG_DIR = os.path.join(DATA_DIR, "images")
OUT_DIR = os.path.join(CURRENT_DIR, "evaluation_output")
os.makedirs(OUT_DIR, exist_ok=True)

CAT_COLUMNS = [
    "_brand",
    "model",
    "version_extracted",
    "gearbox",
    "fuel",
    "body_type_clean",
    "origin_clean",
    "exterior_color",
    "drivetrain_clean",
]


def _load_images(df: pd.DataFrame) -> np.ndarray:
    images = np.zeros((len(df), 224, 224, 3), dtype="float32")
    for i, folder_name in enumerate(df["image_folder"]):
        img_path = os.path.join(IMG_DIR, str(folder_name), "img_0.jpg")
        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            images[i] = img.astype("float32") / 255.0
        else:
            images[i] = np.full((224, 224, 3), 0.5, dtype="float32")
    return images


def _encode_categorical(
    train_series: pd.Series, other_series: pd.Series, eps: float = 1e-7
) -> tuple[np.ndarray, np.ndarray]:
    le = LabelEncoder()
    le.fit(train_series.astype(str))
    mapping = {c: i for i, c in enumerate(le.classes_)}

    idx_tr = np.array([mapping.get(str(v), 0) for v in train_series.astype(str)])
    idx_ot = np.array([mapping.get(str(v), 0) for v in other_series.astype(str)])
    mx = float(idx_tr.max()) if len(idx_tr) else 0.0
    if mx > 0:
        return (
            (idx_tr / (mx + eps)).astype("float32").reshape(-1, 1),
            (idx_ot / (mx + eps)).astype("float32").reshape(-1, 1),
        )
    return (
        idx_tr.astype("float32").reshape(-1, 1),
        idx_ot.astype("float32").reshape(-1, 1),
    )


def build_meta_and_text(
    df_train: pd.DataFrame,
    df_other: pd.DataFrame,
    tfidf: TfidfVectorizer | None,
    scaler_year_odo: MinMaxScaler | None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, TfidfVectorizer, MinMaxScaler]:
    encoded_train_parts = []
    encoded_other_parts = []

    for col in CAT_COLUMNS:
        tr_norm, ot_norm = _encode_categorical(df_train[col], df_other[col])
        encoded_train_parts.append(tr_norm)
        encoded_other_parts.append(ot_norm)

    df_train = df_train.copy()
    df_other = df_other.copy()
    df_train["is_single_owner"] = df_train["is_single_owner"].astype(int)
    df_other["is_single_owner"] = df_other["is_single_owner"].astype(int)
    encoded_train_parts.append((df_train["is_single_owner"] / 1.0).values.reshape(-1, 1))
    encoded_other_parts.append((df_other["is_single_owner"] / 1.0).values.reshape(-1, 1))

    encoded_train_parts.append((df_train["seats_clean"] / 8.0).values.reshape(-1, 1))
    encoded_other_parts.append((df_other["seats_clean"] / 8.0).values.reshape(-1, 1))

    if scaler_year_odo is None:
        scaler = MinMaxScaler()
        num_tr = scaler.fit_transform(df_train[["year", "odo"]].values)
    else:
        scaler = scaler_year_odo
        num_tr = scaler.transform(df_train[["year", "odo"]].values)

    num_ot = scaler.transform(df_other[["year", "odo"]].values)

    meta_train = np.hstack([num_tr] + encoded_train_parts).astype("float32")
    meta_other = np.hstack([num_ot] + encoded_other_parts).astype("float32")

    text_tr_raw = df_train["description"].fillna("xe đẹp nguyên bản")
    text_ot_raw = df_other["description"].fillna("xe đẹp nguyên bản")

    if tfidf is None:
        tfidf = TfidfVectorizer(max_features=100)
        text_train = tfidf.fit_transform(text_tr_raw).toarray().astype("float32")
    else:
        text_train = tfidf.transform(text_tr_raw).toarray().astype("float32")

    text_other = tfidf.transform(text_ot_raw).toarray().astype("float32")

    return meta_train, meta_other, text_train, text_other, tfidf, scaler


def y_scale_million_to_net(y_million: np.ndarray) -> np.ndarray:
    return (y_million / 100.0).astype("float32")


def y_net_to_million(y_net: np.ndarray) -> np.ndarray:
    return (y_net * 100.0).astype("float64")


def metrics(y_true_m: np.ndarray, y_pred_m: np.ndarray) -> dict:
    e = y_pred_m - y_true_m
    mae = float(np.mean(np.abs(e)))
    rmse = float(np.sqrt(np.mean(e**2)))
    mask = np.abs(y_true_m) > 1e-6
    mape = float(np.mean(np.abs(e[mask] / y_true_m[mask])) * 100) if mask.any() else 0.0
    return {"mae_million": mae, "rmse_million": rmse, "mape_percent": mape}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--init-weights",
        type=str,
        default="",
        help="Đường dẫn tới .keras có sẵn (tùy chọn). Encoder vẫn fit trên train.",
    )
    args = parser.parse_args()

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    sys.path.insert(0, CURRENT_DIR)
    from multimodal_model import create_multimodal_model

    import tensorflow as tf
    from tensorflow.keras.optimizers import Adam

    if not os.path.isfile(CSV_PATH):
        print(f"Không tìm thấy {CSV_PATH}")
        sys.exit(1)

    df = pd.read_csv(CSV_PATH)
    df = df.dropna(subset=["price_million", "year", "odo", "image_folder"]).reset_index(
        drop=True
    )

    df_trainval, df_test = train_test_split(
        df, test_size=0.20, random_state=args.seed
    )
    df_train, df_val = train_test_split(
        df_trainval, test_size=0.20, random_state=args.seed
    )

    meta_tr, meta_va, text_tr, text_va, tfidf, scaler = build_meta_and_text(
        df_train, df_val, None, None
    )
    _, meta_te, _, text_te, _, _ = build_meta_and_text(
        df_train, df_test, tfidf, scaler
    )

    img_tr = _load_images(df_train)
    img_va = _load_images(df_val)
    img_te = _load_images(df_test)

    y_tr = y_scale_million_to_net(df_train["price_million"].values)
    y_va = y_scale_million_to_net(df_val["price_million"].values)
    y_te = y_scale_million_to_net(df_test["price_million"].values)

    num_meta = meta_tr.shape[1]
    text_dim = text_tr.shape[1]
    if text_dim != 100:
        print(
            f"Cảnh báo: TF-IDF có {text_dim} chiều, kiến trúc multimodal_model dùng 100. "
            "Nên đặt max_features=100 hoặc chỉnh text_input trong multimodal_model.py."
        )

    model = create_multimodal_model(
        input_shape_img=(224, 224, 3), num_metadata_features=num_meta
    )
    model.compile(optimizer=Adam(learning_rate=1e-4), loss="mae", metrics=["mae"])

    if args.init_weights and os.path.isfile(args.init_weights):
        try:
            model.load_weights(args.init_weights)
            print("Đã nạp weights:", args.init_weights)
        except Exception as ex:
            print("Không nạp được weights (bỏ qua):", ex)

    cb = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=8, restore_best_weights=True
        )
    ]

    history = model.fit(
        [img_tr, meta_tr, text_tr],
        y_tr,
        validation_data=([img_va, meta_va, text_va], y_va),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=cb,
        verbose=1,
    )

    pred_te_net = model.predict([img_te, meta_te, text_te], verbose=0).reshape(-1)
    pred_te_m = y_net_to_million(pred_te_net)
    true_te_m = df_test["price_million"].values.astype("float64")

    m = metrics(true_te_m, pred_te_m)

    summary = {
        "n_total": len(df),
        "n_train": len(df_train),
        "n_val": len(df_val),
        "n_test": len(df_test),
        "seed": args.seed,
        "epochs_ran": len(history.history.get("loss", [])),
        **m,
    }

    with open(os.path.join(OUT_DIR, "test_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    # --- Hình 1: learning curve ---
    h = history.history
    if "loss" in h and "val_loss" in h:
        plt.figure(figsize=(8, 5))
        plt.plot(h["loss"], label="train MAE (scaled target)")
        plt.plot(h["val_loss"], label="val MAE (scaled target)")
        plt.xlabel("Epoch")
        plt.ylabel("Loss (MAE)")
        plt.legend()
        plt.title("Quá trình huấn luyện")
        plt.tight_layout()
        plt.savefig(os.path.join(OUT_DIR, "fig_training_curve.png"), dpi=150)
        plt.close()

    # --- Hình 2: scatter giá thật vs dự đoán (triệu) ---
    plt.figure(figsize=(6, 6))
    plt.scatter(true_te_m, pred_te_m, alpha=0.35, s=12)
    lims = [
        min(true_te_m.min(), pred_te_m.min()),
        max(true_te_m.max(), pred_te_m.max()),
    ]
    plt.plot(lims, lims, "r--", label="y = x")
    plt.xlabel("Giá thực tế (triệu VND)")
    plt.ylabel("Giá dự đoán (triệu VND)")
    plt.title("Tập kiểm thử")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_scatter_true_pred.png"), dpi=150)
    plt.close()

    # --- Hình 3: phân bố sai số ---
    err = pred_te_m - true_te_m
    plt.figure(figsize=(8, 4))
    plt.hist(err, bins=40, color="steelblue", edgecolor="white")
    plt.xlabel("Sai số (triệu): dự đoán - thực tế")
    plt.ylabel("Số mẫu")
    plt.title("Phân bố sai số trên tập test")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_error_distribution.png"), dpi=150)
    plt.close()

    print("\n=== KẾT QUẢ TẬP TEST (triệu VND) ===")
    print(json.dumps(m, ensure_ascii=False, indent=2))
    print(f"\nĐã lưu hình và JSON vào: {OUT_DIR}")


if __name__ == "__main__":
    main()
