import os
import logging
from datetime import datetime
from typing import List
import re

from fastapi import FastAPI, UploadFile, File, Form

import model_loader
from image_validator import is_valid_car_image
from price_service   import preprocess_image, preprocess_tabular, preprocess_text, predict_price
from damage_detector import detect_damage
from utils           import get_penalty, to_base64

from src.core.config import FAULT_KEYWORDS

logger = logging.getLogger(__name__)

model_loader.load_all()

app = FastAPI(title="Car Valuation API", version="2.0")


def extract_faults_from_description(text: str) -> list:
    if not text:
        return []

    text = text.lower()
    detected_keys = []

    for key, patterns in FAULT_KEYWORDS.items():
        for pattern in patterns:
            if re.search(r'\b' + re.escape(pattern) + r'\b', text):
                detected_keys.append(key)
                break

    return detected_keys

@app.post("/predict-price")
async def predict_price_endpoint(
        files: List[UploadFile] = File(...),
        model_name: str = Form(...),
        trim_name: str = Form(...),
        year: int = Form(...),
        odo: int = Form(...),
        fuel: str = Form(...),
        origin: str = Form("Việt Nam"),
        owner_count: int = Form(1),
        service_history: bool = Form(True),
        description: str = Form(""),
        body_type: str = Form("SUV"),
        color: str = Form("Trắng"),
        gearbox: str = Form("Tự động"),
        seats: int = Form(5)
):
    if not model_loader.is_ready():
        return {"success": False, "error": "Model chưa sẵn sàng."}

    first_bytes = await files[0].read()
    temp_path   = f"_temp_{files[0].filename}"
    with open(temp_path, "wb") as f:
        f.write(first_bytes)

    try:
        #Level 1: YOLO — loai anh khong phai la xe o to
        is_car, label, conf = is_valid_car_image(temp_path)
        if not is_car:
            return {"success": False, "error": "Ảnh không phải xe hơi hoặc quá mờ."}

        #Level 2: GROQ — kiem tra dung dong xe khai bao


        #Level 3: du doan gia goc cua chiec xe
        img_bgr_main, img_in = preprocess_image(first_bytes)
        if img_in is None:
            return {"success": False, "error": "Không đọc được ảnh."}

        meta_in, full_name = preprocess_tabular(
            model_name=model_name,
            trim_name=trim_name,
            year=year,
            odo=odo,
            fuel=fuel,
            body_type=body_type,
            color=color,
            gearbox=gearbox,
            origin=origin,
            owner_count=owner_count,
            seats=seats
        )
        text_in            = preprocess_text(full_name, year, origin, owner_count, service_history, description)
        raw_price          = round(predict_price(img_in, meta_in, text_in), 2)

        #Trich xuat cac loi trong mo ta da viet
        declared_keys = extract_faults_from_description(description)

        #Khoi tao bien da khau tru
        paid_fault_keys = set()  # Lưu các key ĐÃ bị trừ tiền
        total_deduction = 0.0
        damage_details = []
        processed_images = []

        #Tru tien loi nguoi dung da khai bao truoc o description
        for key in declared_keys:
            penalty = get_penalty(key)
            total_deduction += penalty
            paid_fault_keys.add(key)

            damage_details.append({
                "category": "DECLARED",
                "type": f"Người dùng khai báo: {key}",
                "key": key,
                "penalty": penalty,
                "source": "description"
            })

        #Soi tray xuoc o xe
        for f in files:
            await f.seek(0)
            content = await f.read()
            if not content: continue

            img_bgr, _ = preprocess_image(content)
            if img_bgr is None: continue
            annotated, damages = detect_damage(img_bgr)
            processed_images.append(to_base64(annotated))

            for d in damages:
                key = d["item_key"]

                if key not in paid_fault_keys:
                    penalty = get_penalty(key)
                    total_deduction += penalty

                    damage_details.append({
                        "category": "EXTERIOR_AI",
                        "type": f"{d['label']} (AI phát hiện thêm)",
                        "key": key,
                        "penalty": penalty,
                        "file": f.filename,
                    })
                    paid_fault_keys.add(key)
                else:
                    logger.info(f"Bỏ qua khấu trừ trùng cho lỗi {key} trên file {f.filename}")

        #Khau tru odo vuot chuan
        std_odo   = max(1, datetime.now().year - year) * 15_000
        over_km   = max(0, (odo - std_odo) // 1_000)
        if over_km > 0:
            p_odo = get_penalty("ODO_01") * over_km
            total_deduction += p_odo
            damage_details.append({
                "category": "USAGE",
                "type":     f"Vượt ODO {over_km}k km",
                "key":      "ODO_01",
                "penalty":  p_odo,
            })

        #Khau tru nhieu doi chu
        if owner_count >= 2:
            p = get_penalty("HIS_02")
            total_deduction += p
            damage_details.append({"category": "HISTORY", "type": f"Qua {owner_count} đời chủ",
                                    "key": "HIS_02", "penalty": p})

        final_price = max(0.0, round(raw_price - total_deduction, 2))

        return {
            "success": True,
            "data": {
                "summary": {
                    "raw_price":       raw_price,
                    "total_deduction": round(total_deduction, 2),
                    "final_price":     final_price,
                },
                "damage_list":       damage_details,
                "processed_images":  processed_images,
            },
        }

    except Exception as e:
        logger.error(f"predict_price_endpoint: {e}")
        return {"success": False, "error": "Lỗi xử lý nội bộ."}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("valuation_service:app", host="0.0.0.0", port=8000, reload=True)