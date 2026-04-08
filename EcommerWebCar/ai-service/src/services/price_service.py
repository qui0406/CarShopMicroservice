import cv2
import numpy as np
from typing import Tuple, Optional
import logging

from src.services import model_loader

logger = logging.getLogger(__name__)


def preprocess_image(image_bytes: bytes) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    nparr   = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return None, None

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_res = cv2.resize(img_rgb, (224, 224))
    img_in  = np.expand_dims(img_res.astype("float32") / 255.0, axis=0)
    return img_bgr, img_in


def safe_encode(encoder, value: str) -> float:
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


def preprocess_tabular(
        model_name:  str,
        trim_name:   str,
        year:        int,
        odo:         int,
        fuel:        str,
        body_type:   str,
        color:       str,
        gearbox:     str,
        origin:      str,
        owner_count: int,
        seats:       int
) -> Tuple[Optional[np.ndarray], str]:
    full_name = f"{model_name} {trim_name}".strip()

    num_s           = model_loader.scaler.transform([[year, odo]])
    is_single_owner = 1.0 if owner_count == 1 else 0.0
    seats_scaled    = float(seats) / 8.0
    meta_in         = np.zeros((1, 11), dtype="float32")

    meta_in[0, 0]  = num_s[0, 0]                                           # year
    meta_in[0, 1]  = num_s[0, 1]                                           # odo
    meta_in[0, 2]  = safe_encode(model_loader.le_model,     model_name)    # model
    meta_in[0, 3]  = safe_encode(model_loader.le_version,   trim_name)     # version_extracted
    meta_in[0, 4]  = safe_encode(model_loader.le_gearbox,   gearbox.capitalize())
    meta_in[0, 5]  = safe_encode(model_loader.le_fuel,      fuel.capitalize())
    meta_in[0, 6]  = safe_encode(model_loader.le_body_type, body_type.upper())
    meta_in[0, 7]  = safe_encode(model_loader.le_origin,    origin.capitalize())
    meta_in[0, 8]  = safe_encode(model_loader.le_color,     color.capitalize())
    meta_in[0, 9]  = is_single_owner
    meta_in[0, 10] = seats_scaled

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

    vec          = model_loader.tfidf.transform([text]).toarray().astype("float32")
    expected_dim = model_loader.price_model.input_shape[2][1]
    text_in      = np.zeros((1, expected_dim), dtype="float32")
    dim          = min(vec.shape[1], expected_dim)
    text_in[:, :dim] = vec[:, :dim]
    return text_in


def predict_price(img_in: np.ndarray, meta_in: np.ndarray, text_in: np.ndarray) -> float:
    pred = model_loader.price_model.predict(
        {"image_input": img_in, "meta_input": meta_in, "text_input": text_in},
        verbose=0,
    )
    return float(pred[0][0]) * 100.0
