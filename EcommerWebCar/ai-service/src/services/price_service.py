import cv2
import numpy as np
from datetime import datetime
from typing import Tuple, Optional
import logging
import re
import tensorflow as tf

from src.services import model_loader

logger = logging.getLogger(__name__)


def preprocess_image(image_bytes: bytes) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Không thể đọc ảnh (có thể file hỏng hoặc định dạng không hỗ trợ).")
    
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    
    # Chuẩn hóa ảnh về khoảng [0, 1] giống y hệt khi huấn luyện model
    img_in = img_resized.astype("float32") / 255.0
    img_in = np.expand_dims(img_in, axis=0)
    
    return img_bgr, img_in


def fuzzy_match(val: str, valid_classes: list) -> str:
    def normalize(s):
        return re.sub(r'[\s\-\_]', '', str(s).lower())
        
    val_norm = normalize(val)
    
    # 1. Exact normalized match
    for cls in valid_classes:
        if normalize(cls) == val_norm:
            return cls
            
    # 2. Substring match on normalized strings
    candidates = [cls for cls in valid_classes if val_norm in normalize(cls) or normalize(cls) in val_norm]
    if candidates:
        return max(candidates, key=lambda c: len(str(c)))
        
    return val # fallback to original if no match


def preprocess_tabular(
        brand_name:      str,
        model_name:      str,
        trim_name:       str,
        year:            int,
        odo:             int,
        fuel:            str,
        body_type:       str,
        color:           str,
        gearbox:         str,
        origin:          str,
        owner_count:     int,
        seats:           int,
        engine_capacity: float = 2.0,
        drivetrain:      str = "FWD",
        airbags:         int = 6
) -> Tuple[Optional[np.ndarray], str]:
    full_name = f"{model_name} {trim_name}".strip()

    # Đồng bộ năm neo giữ làm CURRENT_YEAR là 2025 giống hệt khi huấn luyện và fit scaler
    CURRENT_YEAR = 2025
    car_age = max(0, CURRENT_YEAR - year)
    
    num_s = model_loader.scaler.transform([[year, odo, car_age]])
    
    bt_val = "SUV" if body_type.strip().upper() == "SUV" else body_type.strip().capitalize()
    
    cat_vals = [
        fuzzy_match(brand_name, model_loader.ohe.categories_[0]),
        fuzzy_match(model_name, model_loader.ohe.categories_[1]),
        fuzzy_match(trim_name, model_loader.ohe.categories_[2]),
        fuzzy_match(gearbox.capitalize(), model_loader.ohe.categories_[3]),
        fuzzy_match(fuel.capitalize(), model_loader.ohe.categories_[4]),
        fuzzy_match(bt_val, model_loader.ohe.categories_[5]),
        fuzzy_match(origin.title(), model_loader.ohe.categories_[6]),
        fuzzy_match(color.capitalize(), model_loader.ohe.categories_[7]),
        fuzzy_match(drivetrain.upper(), model_loader.ohe.categories_[8])
    ]
    
    logger.info(f"Fuzzy matched categories: {cat_vals}")
    
    cat_encoded = model_loader.ohe.transform([cat_vals])
    
    is_single_owner = 1.0 if owner_count == 1 else 0.0
    seats_scaled    = float(seats) / 8.0
    cap_scaled      = float(engine_capacity) / 5.0
    air_scaled      = float(airbags) / 10.0
    
    other_num = np.array([[is_single_owner, seats_scaled, cap_scaled, air_scaled]], dtype="float32")
    
    meta_in = np.hstack([num_s, cat_encoded, other_num]).astype("float32")

    return meta_in, full_name


def preprocess_text(
    full_name:       str,
    year:            int,
    origin:          str,
    owner_count:     int,
    service_history: bool,
    description:     str,
) -> np.ndarray:
    baoduong = "Bảo dưỡng hãng đầy đủ" if service_history else "Bảo dưỡng ngoài"
    text     = (
        f"Xe {full_name} đời {year}. "
        f"Xuất xứ {origin}, {owner_count} đời chủ. "
        f"{baoduong}. {description}"
    )

    vec = model_loader.tfidf.transform([text]).toarray().astype("float32")
    return vec


def predict_price(img_in: np.ndarray, meta_in: np.ndarray, text_in: np.ndarray) -> float:
    pred = model_loader.price_model.predict(
        {"image_input": img_in, "meta_input": meta_in, "text_input": text_in},
        verbose=0,
    )
    return float(np.mean(np.expm1(pred)))
