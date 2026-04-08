import os
from ultralytics import YOLO

_HERE = os.path.dirname(os.path.abspath(__file__))

# models/ nằm ở root: src/services/ -> root -> models/
_YOLOV8_PATH = os.path.join(_HERE, "..", "..", "models", "yolov8n.pt")

_yolo = YOLO(_YOLOV8_PATH)

_VALID_LABELS = {"car", "truck", "bus"}


def is_valid_car_image(image_path: str, confidence_threshold: float = 0.6) \
        -> tuple[bool, str | None, float]:
    results = _yolo.predict(source=image_path, conf=confidence_threshold, verbose=False)

    for r in results:
        for box in r.boxes:
            label = _yolo.names[int(box.cls[0])]
            conf  = float(box.conf[0])
            if label in _VALID_LABELS:
                return True, label, conf

    return False, None, 0.0
