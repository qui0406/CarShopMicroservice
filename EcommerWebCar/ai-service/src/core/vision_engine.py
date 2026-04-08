import cv2
from ultralytics import YOLO
from PIL import Image
import io
import base64
import numpy as np
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
YOLO_WEIGHTS_PATH = os.path.join(_PROJECT_ROOT, "researchers", "experiments", "yolov8n.pt")

model = YOLO(YOLO_WEIGHTS_PATH)

def detect_and_crop_car(image_bytes):
    #chuyen sang opencv
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Class 2 trong tập COCO là 'car' (ô tô)
    results = model(img, classes=[2])

    if len(results[0].boxes) == 0:
        return None

    box = results[0].boxes[0].xyxy[0].cpu().numpy()
    x1, y1, x2, y2 = map(int, box)
    cropped_img = img[y1:y2, x1:x2]

    cropped_pil = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
    return cropped_pil


def pil_to_base64(pil_image):
    byte_arr = io.BytesIO()
    pil_image.save(byte_arr, format='JPEG')
    return base64.b64encode(byte_arr.getvalue()).decode('utf-8')