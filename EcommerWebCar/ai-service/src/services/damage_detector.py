import numpy as np
import os
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_HERE = os.path.dirname(os.path.abspath(__file__))

# models/ nằm ở root: src/services/ -> root -> models/
YOLO_WEIGHTS = os.path.join(_HERE, "..", "..", "model", "weights", "yolo_car_damage_best.pt")

try:
    print(f"Đang nạp YOLO damage model: {YOLO_WEIGHTS}")
    damage_model = YOLO(YOLO_WEIGHTS)
    print("Nạp YOLO thành công")
except Exception as e:
    logger.error(e)
    damage_model = None


def detect_damage(image_bgr: np.ndarray) -> tuple[np.ndarray, list[dict]]:
    damages = []

    if damage_model is None:
        return image_bgr, damages

    results = damage_model(image_bgr, conf=0.25, verbose=False)
    result  = results[0]
    annotated_img = result.plot()
    boxes = result.boxes

    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        w    = x2 - x1
        h    = y2 - y1
        area = w * h

        class_id   = int(box.cls[0])
        conf_score = float(box.conf[0])
        class_name = result.names[class_id]

        if class_name == "scratch":
            if area < 10000:
                key, label = "EXT_01", "Trầy xước nhẹ"
            else:
                key, label = "EXT_02", "Trầy xước sâu"
        elif class_name == "dent":
            key, label = "EXT_03", "Móp méo thân vỏ"
        else:
            key, label = "EXT_04", f"Lỗi ngoại thất ({class_name})"

        damages.append({
            "item_key": key,
            "label":    f"{label} ({int(conf_score*100)}%)",
            "area":     int(area),
            "box":      [int(x1), int(y1), int(w), int(h)],
        })

    return annotated_img, damages
