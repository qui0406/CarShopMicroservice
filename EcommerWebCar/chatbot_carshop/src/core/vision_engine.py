import cv2
from ultralytics import YOLO
from PIL import Image
import io
import base64
import numpy as np

# 1. Khởi tạo mô hình YOLO (Sử dụng bản 'n' - nano để chạy nhanh nhất)
model = YOLO('yolov8n.pt')


def detect_and_crop_car(image_bytes):
    # Chuyển bytes ảnh sang định dạng OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Nhận diện vật thể
    results = model(img, classes=[2])  # Class 2 trong tập COCO là 'car' (ô tô)

    if len(results[0].boxes) == 0:
        return None  # Không tìm thấy ô tô nào

    # 3. Lấy tọa độ của chiếc xe có độ tự tin (confidence) cao nhất
    box = results[0].boxes[0].xyxy[0].cpu().numpy()  # [x1, y1, x2, y2]
    x1, y1, x2, y2 = map(int, box)

    # 4. Cắt vùng ảnh chứa xe (Crop)
    cropped_img = img[y1:y2, x1:x2]

    # Chuyển đổi ảnh đã cắt sang PIL Image để dễ xử lý Base64
    cropped_pil = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))

    return cropped_pil


def pil_to_base64(pil_image):
    byte_arr = io.BytesIO()
    pil_image.save(byte_arr, format='JPEG')
    return base64.b64encode(byte_arr.getvalue()).decode('utf-8')