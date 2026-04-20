"""
debug_price.py
Chạy: python debug_price.py
Kiểm tra xem input inference có khớp với training không.
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

print("=== Load model & transformers ===")
model       = tf.keras.models.load_model(os.path.join(MODEL_DIR, "car_price_model1.keras"))
scaler      = joblib.load(os.path.join(TRANSFORMERS_DIR, "scaler_numeric.pkl"))
tfidf       = joblib.load(os.path.join(TRANSFORMERS_DIR, "tfidf_vectorizer.pkl"))
le_model    = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_model.pkl"))
le_version  = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_version_extracted.pkl"))
le_gearbox  = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_gearbox.pkl"))
le_fuel     = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_fuel.pkl"))
le_body     = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_body_type_clean.pkl"))
le_origin   = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_origin_clean.pkl"))
le_color    = joblib.load(os.path.join(TRANSFORMERS_DIR, "le_exterior_color.pkl"))

print("Model input_shape:", model.input_shape)
print()

# ─── Tham số xe thử nghiệm (CX-5 2022 giá ~855 triệu) ───
model_name  = "CX-5"
trim_name   = "2.0 AT"
year        = 2022
odo         = 30000
fuel        = "Xăng"
body_type   = "SUV"
color       = "Trắng"
gearbox     = "Tự động"
origin      = "Việt Nam"
owner_count = 1
seats       = 5

# ─── Safe encode (giống inference hiện tại) ───
def safe_encode_INFERENCE(encoder, value):
    if encoder is None:
        return 0.0
    try:
        if value in encoder.classes_:
            idx     = encoder.transform([value])[0]
            max_val = len(encoder.classes_) - 1
            return float(idx) / max_val if max_val > 0 else 0.0
        else:
            return 0.0
    except Exception:
        return 0.0

# ─── Safe encode (giống data_loader khi training) ───
def safe_encode_TRAINING(encoder, value):
    if encoder is None:
        return 0.0
    try:
        known  = set(encoder.classes_)
        safe_v = value if value in known else encoder.classes_[0]
        idx    = encoder.transform([safe_v])[0]
        max_val = len(encoder.classes_) - 1
        norm    = idx / (max_val + 1e-7) if max_val > 0 else 0.0
        return float(norm)
    except Exception:
        return 0.0

car_age = max(0, 2025 - year)
log_odo = float(np.log1p(max(0, odo)))

num_s = scaler.transform([[year, odo, car_age, log_odo]])

print("=== Scaled numeric (year, odo, car_age, log_odo) ===")
print(num_s)

bt_val = "SUV" if body_type.strip().upper() == "SUV" else body_type.strip().capitalize()

# ─── Build meta INFERENCE style ───
meta_inf = np.zeros((1, 13), dtype="float32")
meta_inf[0, 0]  = num_s[0, 0]
meta_inf[0, 1]  = num_s[0, 1]
meta_inf[0, 2]  = num_s[0, 2]
meta_inf[0, 3]  = num_s[0, 3]
meta_inf[0, 4]  = safe_encode_INFERENCE(le_model,   model_name)
meta_inf[0, 5]  = safe_encode_INFERENCE(le_version, trim_name)
meta_inf[0, 6]  = safe_encode_INFERENCE(le_gearbox, gearbox.capitalize())
meta_inf[0, 7]  = safe_encode_INFERENCE(le_fuel,    fuel.capitalize())
meta_inf[0, 8]  = safe_encode_INFERENCE(le_body,    bt_val)
meta_inf[0, 9]  = safe_encode_INFERENCE(le_origin,  origin.title())
meta_inf[0, 10] = safe_encode_INFERENCE(le_color,   color.capitalize())
meta_inf[0, 11] = 1.0 if owner_count == 1 else 0.0
meta_inf[0, 12] = float(seats) / 8.0

# ─── Build meta TRAINING style ───
meta_trn = np.zeros((1, 13), dtype="float32")
meta_trn[0, 0]  = num_s[0, 0]
meta_trn[0, 1]  = num_s[0, 1]
meta_trn[0, 2]  = num_s[0, 2]
meta_trn[0, 3]  = num_s[0, 3]
meta_trn[0, 4]  = safe_encode_TRAINING(le_model,   model_name)
meta_trn[0, 5]  = safe_encode_TRAINING(le_version, trim_name)
meta_trn[0, 6]  = safe_encode_TRAINING(le_gearbox, gearbox)
meta_trn[0, 7]  = safe_encode_TRAINING(le_fuel,    fuel)
meta_trn[0, 8]  = safe_encode_TRAINING(le_body,    body_type)
meta_trn[0, 9]  = safe_encode_TRAINING(le_origin,  origin)
meta_trn[0, 10] = safe_encode_TRAINING(le_color,   color)
meta_trn[0, 11] = 1.0 if owner_count == 1 else 0.0
meta_trn[0, 12] = float(seats) / 8.0

print()
print("=== Meta INFERENCE vs TRAINING ===")
labels = ["year", "odo", "car_age", "log_odo",
          "model", "version", "gearbox", "fuel",
          "body_type", "origin", "color", "single_owner", "seats"]
for i, lbl in enumerate(labels):
    diff = "✅" if abs(meta_inf[0,i] - meta_trn[0,i]) < 1e-4 else f"❌ DIFF"
    print(f"  [{i:2d}] {lbl:15s}  inf={meta_inf[0,i]:.4f}  trn={meta_trn[0,i]:.4f}  {diff}")

# ─── Text input ───
full_name = f"{model_name} {trim_name}".strip()
text_raw  = f"Xe {full_name} đời {year}. Xuất xứ {origin}, {owner_count} đời chủ. Bảo dưỡng hãng đầy đủ."
vec       = tfidf.transform([text_raw]).toarray().astype("float32")
expected_dim = model.input_shape[2][1]
text_in   = np.zeros((1, expected_dim), dtype="float32")
dim       = min(vec.shape[1], expected_dim)
text_in[:, :dim] = vec[:, :dim]

# ─── Image input (blank) ───
img_in = np.zeros((1, 224, 224, 3), dtype="float32")

print()
print("=== Predict với meta INFERENCE ===")
pred_inf = model.predict({"image_input": img_in, "meta_input": meta_inf, "text_input": text_in}, verbose=0)
price_inf = float(np.expm1(float(pred_inf[0][0])))
print(f"  raw log pred : {float(pred_inf[0][0]):.4f}")
print(f"  price (triệu): {price_inf:.2f}")

print()
print("=== Predict với meta TRAINING ===")
pred_trn = model.predict({"image_input": img_in, "meta_input": meta_trn, "text_input": text_in}, verbose=0)
price_trn = float(np.expm1(float(pred_trn[0][0])))
print(f"  raw log pred : {float(pred_trn[0][0]):.4f}")
print(f"  price (triệu): {price_trn:.2f}")

# ─── Debug encoder labels ───
print()
print("=== Label Encoder classes ===")
for name, le in [("model",   le_model),
                 ("version", le_version),
                 ("gearbox", le_gearbox),
                 ("fuel",    le_fuel),
                 ("body",    le_body),
                 ("origin",  le_origin),
                 ("color",   le_color)]:
    print(f"  {name:10s}: {list(le.classes_)}")
