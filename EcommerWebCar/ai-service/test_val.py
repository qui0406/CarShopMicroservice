import os
import pandas as pd
import numpy as np
import tensorflow as tf
from src.services import model_loader, price_service

model_loader.load_all()
df = pd.read_csv('data/processed/val.csv').head(20)

for idx, row in df.iterrows():
    try:
        year = int(row['year'])
        odo = float(row['odo'])
        meta_in, fn = price_service.preprocess_tabular(
            model_name=row['model'], trim_name=row['version_extracted'],
            year=year, odo=odo, fuel=row.get('fuel', "Xăng"),
            body_type=row.get('body_type_clean', "Sedan"),
            color=row.get('exterior_color', 'Khác'),
            gearbox=row.get('gearbox', 'Tự động'),
            origin=row.get('origin_clean', 'Khác'),
            owner_count=1 if row.get('is_single_owner') else 2,
            seats=int(row.get('seats_clean', 5))
        )
        text_in = price_service.preprocess_text(
            full_name=fn, year=year, origin=row.get('origin_clean', 'Khác'),
            owner_count=1, service_history=True, description=str(row.get('description', ''))
        )
        img_in = np.zeros((1, 224, 224, 3), dtype="float32")
        # Just passing dummy image for quick testing
        pred = model_loader.price_model.predict({"image_input": img_in, "meta_input": meta_in, "text_input": text_in}, verbose=0)[0][0]
        
        true_p = row['price_million']
        p_100 = pred * 100
        p_exp = np.expm1(pred)
        
        print(f"[{idx}] True: {true_p:6.1f} | Pred_raw: {pred:5.2f} | *100: {p_100:6.1f} | expm1: {p_exp:6.1f}")
    except Exception as e:
        print(f"[{idx}] Error: {e}")

