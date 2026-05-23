import os
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_PATH = "/Users/anhqui/Documents/CarShopMicroservice/EcommerWebCar/ai-service/data/processed/final_dataset.csv"
OUT_DIR = "/Users/anhqui/Documents/CarShopMicroservice/EcommerWebCar/ai-service/model/transformers"

os.makedirs(OUT_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)

CURRENT_YEAR = 2025
df["car_age"] = (CURRENT_YEAR - df["year"]).clip(lower=0)
df["log_odo"] = np.log1p(df["odo"].clip(lower=0))

# Fit scaler
scaler = MinMaxScaler()
scaler.fit(df[["year", "odo", "car_age", "log_odo"]].values)
joblib.dump(scaler, os.path.join(OUT_DIR, "scaler_numeric.pkl"))

# Fit TFIDF
tfidf = TfidfVectorizer(max_features=100)
tfidf.fit(df["description"].fillna("xe đẹp nguyên bản"))
joblib.dump(tfidf, os.path.join(OUT_DIR, "tfidf_vectorizer.pkl"))

# Fit encoders
cat_cols = {
    "_brand": "le__brand.pkl",
    "model": "le_model.pkl",
    "fuel": "le_fuel.pkl",
    "body_type_clean": "le_body_type_clean.pkl",
    "exterior_color": "le_exterior_color.pkl",
    "gearbox": "le_gearbox.pkl",
    "origin_clean": "le_origin_clean.pkl",
    "version_extracted": "le_version_extracted.pkl",
    "drivetrain_clean": "le_drivetrain_clean.pkl",
}

for col, filename in cat_cols.items():
    if col in df.columns:
        le = LabelEncoder()
        le.fit(df[col].astype(str))
        joblib.dump(le, os.path.join(OUT_DIR, filename))
    else:
        print(f"Warning: column {col} not found in dataset!")

print("Successfully updated all .pkl files in", OUT_DIR)
