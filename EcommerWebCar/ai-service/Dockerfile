# Use official Python image
FROM python:3.10-slim

# Ngăn Python tạo ra các file .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Hiển thị log trực tiếp lên console
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Cài đặt các libraries từ requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng (FastAPI/Flask thường chạy cổng 8000)
EXPOSE 8000

# Tuỳ chỉnh lại lệnh chạy theo framework của bạn
# Ví dụ FastAPI:
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Ví dụ Flask: 
# CMD ["python", "src/main.py"]
