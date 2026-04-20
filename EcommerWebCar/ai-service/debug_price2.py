"""
debug_price2.py - Kiểm tra trim_name matching và giá thực của CX-5 2022 varieties
"""
import os, sys
os.environ["TF_USE_LEGACY_KERAS"] = "0"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import joblib
import tensorflow as tf

MODEL_DIR        = os.path.join(os.path.dirname(__file__), "model")
TRANSFORMERS_DIR = os.path.join(MODEL_DIR, "transformers")

model      = tf.keras.models.load_model(os.path.join(MODEL_DIR, "car_price_model1.keras"))
scaler     = joblib.load(os.path.join(TRANSFORMERS_DIR, "scaler_numeric.pkl"))
tfidf      = joblib.load(os.path.join(TRANSFORMERS_DIR, "tfidf_vectorizer.pkl"))
le_model   = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_model.pkl"))
le_version = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_version_extracted.pkl"))
le_gearbox = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_gearbox.pkl"))
le_fuel    = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_fuel.pkl"))
le_body    = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_body_type_clean.pkl"))
le_origin  = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_origin_clean.pkl"))
le_color   = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_exterior_color.pkl"))

def safe_enc(le, val):
    if val in le.classes_:
        idx = le.transform([val])[0]
        m   = len(le.classes_) - 1
        return float(idx) / (m + 1e-7) if m > 0 else 0.0
    print(f"    ‼ '{val}' NOT IN {le.classes_}")
    return 0.0

def build_and_predict(model_name, trim_name, year, odo, fuel, body_type,
                      color, gearbox, origin, owner_count, seats):
    car_age = max(0, 2025 - year)
    log_odo = float(np.log1p(max(0, odo)))
    num_s   = scaler.transform([[year, odo, car_age, log_odo]])

    meta = np.zeros((1, 13), dtype="float32")
    meta[0, 0]  = num_s[0, 0]
    meta[0, 1]  = num_s[0, 1]
    meta[0, 2]  = num_s[0, 2]
    meta[0, 3]  = num_s[0, 3]
    meta[0, 4]  = safe_enc(le_model,   model_name)
    meta[0, 5]  = safe_enc(le_version, trim_name)
    meta[0, 6]  = safe_enc(le_gearbox, gearbox)
    meta[0, 7]  = safe_enc(le_fuel,    fuel)
    meta[0, 8]  = safe_enc(le_body,    body_type)
    meta[0, 9]  = safe_enc(le_origin,  origin)
    meta[0, 10] = safe_enc(le_color,   color)
    meta[0, 11] = 1.0 if owner_count == 1 else 0.0
    meta[0, 12] = float(seats) / 8.0

    full_name = f"{model_name} {trim_name}".strip()
    text_raw  = f"Xe {full_name} đời {year}. Xuất xứ {origin}, {owner_count} đời chủ. Bảo dưỡng hãng đầy đủ."
    vec       = tfidf.transform([text_raw]).toarray().astype("float32")
    exp_dim   = model.input_shape[2][1]
    text_in   = np.zeros((1, exp_dim), dtype="float32")
    d         = min(vec.shape[1], exp_dim)
    text_in[:, :d] = vec[:, :d]

    img_blank = np.zeros((1, 224, 224, 3), dtype="float32")
    img_gray  = np.full((1, 224, 224, 3), 0.5, dtype="float32")

    pred_b = model.predict({"image_input": img_blank, "meta_input": meta, "text_input": text_in}, verbose=0)
    pred_g = model.predict({"image_input": img_gray,  "meta_input": meta, "text_input": text_in}, verbose=0)
    return float(np.expm1(float(pred_b[0][0]))), float(np.expm1(float(pred_g[0][0])))

print("=== CX-5 2022 — các trim ===")
configs = [
    ("CX-5", "2.0 AT",                    2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.0L AT Deluxe",            2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.0L AT Premium",           2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.0L Signature Premium",    2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.5 AT",                    2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.5 AT AWD",               2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.5 Signature",             2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "2.5L Signature Premium",    2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "Premium 2.5 AT",            2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "Signature Premium 2.5 AT",  2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
    ("CX-5", "Unknown",                   2022, 30000, "Xăng", "SUV", "Trắng", "Tự động", "Việt Nam", 1, 5),
]

for cfg in configs:
    p_blank, p_gray = build_and_predict(*cfg)
    trim = cfg[1]
    print(f"  trim={trim:35s}  blank={p_blank:7.1f}  gray={p_gray:7.1f} triệu")

# ─── Kiểm tra scaler range ───
print()
print("=== Scaler data_range_ (min, max) ===")
print("  year    :", scaler.data_min_[0], "–", scaler.data_max_[0])
print("  odo     :", scaler.data_min_[1], "–", scaler.data_max_[1])
print("  car_age :", scaler.data_min_[2], "–", scaler.data_max_[2])
print("  log_odo :", scaler.data_min_[3], "–", scaler.data_max_[3])

# ─── Kiểm tra training data range ───
DATA_CSV = os.path.join(os.path.dirname(__file__), "data", "processed", "train.csv")
if os.path.exists(DATA_CSV):
    import pandas as pd
    df = pd.read_csv(DATA_CSV)
    print()
    print("=== Training data stats (train.csv) ===")
    print(f"  Giá (triệu): min={df['price_million'].min():.0f}  max={df['price_million'].max():.0f}  median={df['price_million'].median():.0f}")
    print(f"  Năm: {df['year'].min()} – {df['year'].max()}")
    cx5_2022 = df[(df['model']=='CX-5') & (df['year']==2022)]
    print(f"  CX-5 2022: {len(cx5_2022)} mẫu, giá: {cx5_2022['price_million'].min():.0f}–{cx5_2022['price_million'].max():.0f} triệu, median={cx5_2022['price_million'].median():.0f}")
    cx5 = df[df['model']=='CX-5']
    print(f"  CX-5 all: {len(cx5)} mẫu, giá median={cx5['price_million'].median():.0f}")
    print(cx5.groupby('year')['price_million'].median().to_string())
