import os
import sys
import numpy as np
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
import tensorflow as tf

from src.services import model_loader
from src.services.price_service import preprocess_tabular, predict_price

def test_odo():
    model_loader._loaded = False
    model_loader.load_all()
    
    # Dummy text and image
    img = np.zeros((1, 224, 224, 3), dtype="float32")
    text = np.zeros((1, 100), dtype="float32")
    
    odos = [10000, 50000, 100000, 150000, 200000]
    for odo in odos:
        meta, _ = preprocess_tabular(
            brand_name="Hyundai",
            model_name="Kona",
            trim_name="2.0 AT",
            year=2018,
            odo=odo,
            fuel="Xăng",
            body_type="SUV",
            color="Trắng",
            gearbox="Tự động",
            origin="Việt Nam",
            owner_count=1,
            seats=5,
            engine_capacity=2.0,
            drivetrain="FWD",
            airbags=6
        )
        p = predict_price(img, meta, text)
        print(f"ODO: {odo:6d} -> Price: {p:.2f}")

if __name__ == "__main__":
    test_odo()
