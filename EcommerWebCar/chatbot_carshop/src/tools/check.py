import requests
from langchain_core.tools import tool


@tool
def check_inventory_api(car_model: str):
    """
    Truy vấn tồn kho thời gian thực từ Main Service qua API.
    """
    try:
        # Giả sử Main Service có endpoint này
        api_url = f"http://main-service:8080/api/inventory?model={car_model}"
        response = requests.get(api_url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            return f"Thông tin kho cho {car_model}: {data['status']}, số lượng {data['stock']} xe."
        return "Hiện tại không thể lấy dữ liệu từ hệ thống kho."
    except Exception as e:
        return f"Lỗi kết nối Microservice: {str(e)}"