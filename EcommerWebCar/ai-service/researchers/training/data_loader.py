import os
import cv2
import pandas as pd
import numpy as np
import joblib
import logging
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer

CURRENT_DIR= os.path.abspath(__file__)

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))

DATA_DIR = os.path.join(ROOT_DIR, "data", "processed")
CSV_PATH = os.path.join(DATA_DIR, "final_dataset.csv")
IMG_DIR = os.path.join(DATA_DIR, "images")

MODEL_SAVE_DIR = os.path.join(ROOT_DIR, "model", "transformers")

os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

logger = logging.getLogger(__name__)


def load_multimodal_data():
    if not os.path.exists(CSV_PATH):
        logger.warning(f"CSV: {CSV_PATH} doesn't exist")
        return None

    df = pd.read_csv(CSV_PATH)
    eps = 1e-7

    cat_columns = ['model', 'version_extracted', 'gearbox', 'fuel',
                   'body_type_clean', 'origin_clean', 'exterior_color']

    encoded_features = []

    for col in cat_columns:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
        joblib.dump(le, os.path.join(MODEL_SAVE_DIR, f"le_{col}.pkl"))

        max_val = df[f'{col}_encoded'].max()
        norm_val = df[f'{col}_encoded'] / (max_val + eps) if max_val > 0 else df[f'{col}_encoded']
        encoded_features.append(norm_val.values.reshape(-1, 1))

    df['is_single_owner'] = df['is_single_owner'].astype(int)
    encoded_features.append((df['is_single_owner'] / 1.0).values.reshape(-1, 1))

    encoded_features.append((df['seats_clean'] / 8.0).values.reshape(-1, 1))

    scaler = MinMaxScaler()
    numeric_features = df[['year', 'odo']].values
    scaled_numeric = scaler.fit_transform(numeric_features)
    joblib.dump(scaler, os.path.join(MODEL_SAVE_DIR, "scaler_numeric.pkl"))

    meta_data = np.hstack([scaled_numeric] + encoded_features).astype('float32')

    #Chuan hoa hinh anh
    images = np.zeros((len(df), 224, 224, 3), dtype='float32')

    for i, folder_name in enumerate(df['image_folder']):

        # Thay str(car_id) thành str(folder_name)
        img_path = os.path.join(IMG_DIR, str(folder_name), "img_0.jpg")

        img = cv2.imread(img_path)
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            images[i] = img.astype('float32') / 255.0
        else:
            images[i] = np.full((224, 224, 3), 0.5, dtype='float32')

    #Trich xuat dac trung van ban
    tfidf = TfidfVectorizer(max_features=100)
    text_data = tfidf.fit_transform(df['description'].fillna('xe đẹp nguyên bản')).toarray().astype('float32')
    joblib.dump(tfidf, os.path.join(MODEL_SAVE_DIR, "tfidf_vectorizer.pkl"))

    #Target scaling
    prices = (df['price_million'].values / 100.0).astype('float32')

    return images, meta_data, text_data, prices


if __name__ == "__main__":
    imgs, metas, texts, prices = load_multimodal_data()
