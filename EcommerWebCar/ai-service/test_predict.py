import sys
import os
import numpy as np
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
from src.services import model_loader, price_service
import cv2

model_loader.load_all()

def safe_encode(encoder, value: str) -> float:
    if value in encoder.classes_:
        idx = encoder.transform([value])[0]
        max_val = len(encoder.classes_) - 1
        return float(idx) / max_val if max_val > 0 else 0.0
    return 0.0

img_in = np.zeros((1, 224, 224, 3), dtype="float32")

year = 2021
odo = 40000
car_age = max(0, 2025 - year)
log_odo = float(np.log1p(max(0, odo)))

num_s = model_loader.scaler.transform([[year, odo, car_age, log_odo]])

meta_in = np.zeros((1, 13), dtype="float32")
meta_in[0, 0] = num_s[0, 0]
meta_in[0, 1] = num_s[0, 1]
meta_in[0, 2] = num_s[0, 2]
meta_in[0, 3] = num_s[0, 3]

# Using EXACT matches based on classes_
meta_in[0, 4] = safe_encode(model_loader.le_model, "Mazda 3")
meta_in[0, 5] = safe_encode(model_loader.le_version, "1.5L Luxury")
meta_in[0, 6] = safe_encode(model_loader.le_gearbox, "Tự động")
meta_in[0, 7] = safe_encode(model_loader.le_fuel, "Xăng")
meta_in[0, 8] = safe_encode(model_loader.le_body_type, "Sedan") # CORRECT
meta_in[0, 9] = safe_encode(model_loader.le_origin, "Việt Nam")
meta_in[0, 10] = safe_encode(model_loader.le_color, "Trắng")
meta_in[0, 11] = 1.0 # single owner
meta_in[0, 12] = 5.0 / 8.0 # seats

text_in = price_service.preprocess_text(
    full_name="Mazda 3 1.5L Luxury", year=2021, origin="Việt Nam", owner_count=1,
    service_history=True, description="Xe gia đình đi ít bảo dưỡng đầy đủ"
)

pred = model_loader.price_model.predict(
    {"image_input": img_in, "meta_input": meta_in, "text_input": text_in},
    verbose=0,
)
print("Correctly Encoded Raw pred:", pred[0][0])
print("Correctly Encoded ExpM1 returns:", np.expm1(float(pred[0][0])))
print("Correctly Encoded * 100 returns:", float(pred[0][0]) * 100.0)
