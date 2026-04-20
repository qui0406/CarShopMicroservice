
import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import r2_score
from sklearn.ensemble import HistGradientBoostingRegressor

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(os.path.dirname(CURRENT_DIR))

DATA_DIR  = os.path.join(ROOT_DIR, "data", "processed")
TRAIN_CSV = os.path.join(DATA_DIR, "train.csv")
VAL_CSV   = os.path.join(DATA_DIR, "val.csv")
TEST_CSV  = os.path.join(DATA_DIR, "test.csv")
OUT_DIR   = os.path.join(CURRENT_DIR, "evaluation_output")
os.makedirs(OUT_DIR, exist_ok=True)

CAT_COLS = [
    "model", "version_extracted", "gearbox", "fuel",
    "body_type_clean", "origin_clean", "exterior_color",
]
CURRENT_YEAR = 2025


def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["car_age"] = (CURRENT_YEAR - df["year"]).clip(lower=0)
    df["log_odo"] = np.log1p(df["odo"].clip(lower=0))
    return df


def prepare_features(df_train, df_other, encoders=None, scaler=None):
    fit_mode = encoders is None

    if fit_mode:
        encoders = {}
        for col in CAT_COLS:
            le = LabelEncoder()
            le.fit(df_train[col].astype(str))
            encoders[col] = le

    def encode(df):
        parts = []
        for col in CAT_COLS:
            le = encoders[col]
            known = set(le.classes_)
            safe  = df[col].astype(str).apply(lambda v: v if v in known else le.classes_[0])
            parts.append(le.transform(safe).reshape(-1, 1))
        parts.append(df["is_single_owner"].astype(int).values.reshape(-1, 1))
        parts.append(df["seats_clean"].values.reshape(-1, 1))
        num = df[["year", "odo", "car_age", "log_odo"]].values
        return np.hstack([num] + parts).astype("float32")

    raw_train = encode(df_train)
    raw_other = encode(df_other)

    if fit_mode:
        scaler = MinMaxScaler()
        raw_train = scaler.fit_transform(raw_train)
    else:
        raw_train = scaler.transform(raw_train)

    raw_other = scaler.transform(raw_other)
    return raw_train, raw_other, encoders, scaler


def compute_metrics(y_true, y_pred) -> dict:
    err  = y_pred - y_true
    mae  = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err**2)))
    mask = np.abs(y_true) > 1e-6
    mape = float(np.mean(np.abs(err[mask] / y_true[mask])) * 100)
    r2   = float(r2_score(y_true, y_pred))
    w10  = float(np.mean(np.abs(err / (y_true + 1e-6)) <= 0.10) * 100)
    w20  = float(np.mean(np.abs(err / (y_true + 1e-6)) <= 0.20) * 100)
    return {
        "MAE_trieu_VND": round(mae, 2),
        "RMSE_trieu_VND": round(rmse, 2),
        "MAPE_percent": round(mape, 2),
        "R2_score": round(r2, 4),
        "Ti_le_sai_so_under_10pct": round(w10, 2),
        "Ti_le_sai_so_under_20pct": round(w20, 2),
    }


def main():
    for p in (TRAIN_CSV, VAL_CSV, TEST_CSV):
        if not os.path.exists(p):
            print(f"Không tìm thấy: {p}")
            sys.exit(1)

    df_train = engineer(pd.read_csv(TRAIN_CSV))
    df_val   = engineer(pd.read_csv(VAL_CSV))
    df_test  = engineer(pd.read_csv(TEST_CSV))

    X_train, X_val,  enc, scl = prepare_features(df_train, df_val)
    _,       X_test, _,   _   = prepare_features(df_train, df_test, enc, scl)

    X_trainval = np.vstack([X_train, X_val])

    y_train_log    = np.log1p(df_train["price_million"].values)
    y_val_log      = np.log1p(df_val["price_million"].values)
    y_trainval_log = np.concatenate([y_train_log, y_val_log])

    print("Đang train GradientBoosting baseline (sklearn)...")
    model = HistGradientBoostingRegressor(
        loss="absolute_error",
        max_iter=500,
        learning_rate=0.05,
        max_depth=5,
        l2_regularization=1.0,
        early_stopping=True,
        validation_fraction=0.15,
        n_iter_no_change=30,
        random_state=42,
        verbose=0,
    )
    model.fit(X_trainval, y_trainval_log)
    print(f"  Best iteration: {model.n_iter_}")

    pred_log = model.predict(X_test)
    y_pred_m = np.expm1(pred_log)
    y_true_m = df_test["price_million"].values.astype("float64")

    m = compute_metrics(y_true_m, y_pred_m)

    print("\n" + "="*57)
    print("   KẾT QUẢ BASELINE GradientBoosting (tabular-only)")
    print("="*57)
    print(f"  MAE          : {m['MAE_trieu_VND']:.1f} triệu VND")
    print(f"  RMSE         : {m['RMSE_trieu_VND']:.1f} triệu VND")
    print(f"  MAPE         : {m['MAPE_percent']:.1f}%")
    print(f"  R²           : {m['R2_score']:.4f}")
    print(f"  Sai số ≤ 10% : {m['Ti_le_sai_so_under_10pct']:.1f}%")
    print(f"  Sai số ≤ 20% : {m['Ti_le_sai_so_under_20pct']:.1f}%")
    print("="*57)

    summary = {
        "model": "HistGradientBoosting (sklearn, tabular-only, no image, no text)",
        "n_train": len(df_train),
        "n_val": len(df_val),
        "n_test": len(df_test),
        "n_iter": int(model.n_iter_),
        **m,
    }
    json_path = os.path.join(OUT_DIR, "baseline_xgboost_metrics.json")  # giữ tên để eval_model.py đọc được
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Đã lưu: {json_path}")

    mm_path = os.path.join(OUT_DIR, "model_metrics.json")
    comparison_rows = []
    if os.path.exists(mm_path):
        with open(mm_path, encoding="utf-8") as f:
            mm = json.load(f)
        comparison_rows.append({
            "Mô hình": "Multimodal (Ảnh + Metadata + Text)",
            "MAE (triệu)": mm.get("MAE_trieu_VND", "-"),
            "RMSE (triệu)": mm.get("RMSE_trieu_VND", "-"),
            "MAPE (%)": mm.get("MAPE_percent", "-"),
            "R²": mm.get("R2_score", "-"),
        })

    comparison_rows.append({
        "Mô hình": "GradientBoosting (Tabular-only)",
        "MAE (triệu)": m["MAE_trieu_VND"],
        "RMSE (triệu)": m["RMSE_trieu_VND"],
        "MAPE (%)": m["MAPE_percent"],
        "R²": m["R2_score"],
    })

    naive_pred = np.full_like(y_true_m, np.median(y_true_m))
    naive_m    = compute_metrics(y_true_m, naive_pred)
    comparison_rows.append({
        "Mô hình": "Naive Baseline (luôn đoán median)",
        "MAE (triệu)": naive_m["MAE_trieu_VND"],
        "RMSE (triệu)": naive_m["RMSE_trieu_VND"],
        "MAPE (%)": naive_m["MAPE_percent"],
        "R²": naive_m["R2_score"],
    })

    df_cmp = pd.DataFrame(comparison_rows)
    cmp_path = os.path.join(OUT_DIR, "comparison_table.json")
    with open(cmp_path, "w", encoding="utf-8") as f:
        json.dump(comparison_rows, f, ensure_ascii=False, indent=2)

    print("\n📊 BẢNG SO SÁNH CÁC MÔ HÌNH:")
    print(df_cmp.to_string(index=False))
    print(f"\n✅ Đã lưu: {cmp_path}")

    # So sánh cải thiện
    if len(comparison_rows) >= 2 and comparison_rows[0]["Mô hình"].startswith("Multimodal"):
        mm_mae  = float(comparison_rows[0]["MAE (triệu)"])
        gb_mae  = m["MAE_trieu_VND"]
        imp     = (gb_mae - mm_mae) / gb_mae * 100
        if imp > 0:
            print(f"\n  ✅ Multimodal cải thiện MAE so với GBM baseline: {imp:.1f}%")
        else:
            print(f"\n  ⚠️  GBM tốt hơn Multimodal: {-imp:.1f}% → thêm ảnh chất lượng cao sẽ giúp")

    _plot_comparison(df_cmp, os.path.join(OUT_DIR, "model_comparison.png"))

    return m


def _plot_comparison(df_cmp: pd.DataFrame, path: str):
    metrics = ["MAE (triệu)", "MAPE (%)"]
    titles  = ["MAE (triệu VND) — thấp hơn tốt hơn",
               "MAPE (%) — thấp hơn tốt hơn"]
    colors  = ["#4C72B0", "#DD8452", "#55A868"]

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    for ax, metric, title in zip(axes, metrics, titles):
        vals   = df_cmp[metric].astype(float)
        labels = df_cmp["Mô hình"].tolist()
        bars   = ax.bar(range(len(labels)), vals,
                        color=colors[:len(labels)], alpha=0.85, edgecolor="white")
        ax.bar_label(bars, fmt="%.1f", padding=3, fontsize=9)
        ax.set_xticks(range(len(labels)))
        ax.set_xticklabels(labels, rotation=15, ha="right", fontsize=8)
        ax.set_title(title, fontsize=11, fontweight="bold")
        ax.grid(axis="y", alpha=0.3)

    plt.suptitle("So sánh các mô hình dự đoán giá xe Mazda",
                 fontsize=13, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"✅ Đã lưu: {path}")


if __name__ == "__main__":
    main()
