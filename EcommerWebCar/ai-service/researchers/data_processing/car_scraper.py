import os
import time
import csv
import re
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


# Đường dẫn đến file hiện tại
CURRENT_FILE_PATH = os.path.abspath(__file__)

# Lùi lại 2 cấp để về thư mục gốc của dự án (ai-service)
# researchers/training/car_scraper.py -> researchers -> ai-service
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_FILE_PATH)))

# Định nghĩa các thư mục đích dựa trên PROJECT_ROOT
RAW_DATA_DIR = os.path.join(PROJECT_ROOT, "data", "raw", "car_details")
IMAGE_ROOT = os.path.join(PROJECT_ROOT, "data", "raw", "images")
FILE_PATH = os.path.join(RAW_DATA_DIR, "mazda_full_dataset.csv")

# Tạo thư mục nếu chưa có
os.makedirs(RAW_DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_ROOT, exist_ok=True)

print(f"Dữ liệu sẽ được lưu tại: {FILE_PATH}")
CHOTOT_MAZDA_BASE_URL = "https://xe.chotot.com/mua-ban-oto-mazda-sdcb7"

os.makedirs(IMAGE_ROOT, exist_ok=True)
os.makedirs(RAW_DATA_DIR, exist_ok=True)


def clean_price_to_million(price_str):
    try:
        if not price_str or 'Thỏa thuận' in price_str: return 0
        num = int(re.sub(r'[^\d]', '', price_str))
        return round(num / 1_000_000, 2)
    except:
        return 0


def extract_mazda_model(title):
    t = title.upper()
    if 'CX-5' in t or 'CX5' in t: return 'CX-5'
    if 'CX-8' in t or 'CX8' in t: return 'CX-8'
    if 'CX-30' in t or 'CX30' in t: return 'CX-30'
    if 'CX-3' in t or 'CX3' in t: return 'CX-3'
    if 'BT-50' in t or 'BT50' in t: return 'BT-50'
    if 'MAZDA 3' in t or 'MAZDA3' in t or ' 3 ' in t: return 'Mazda 3'
    if 'MAZDA 6' in t or 'MAZDA6' in t or ' 6 ' in t: return 'Mazda 6'
    if 'MAZDA 2' in t or 'MAZDA2' in t or ' 2 ' in t: return 'Mazda 2'
    if '626' in t: return 'Mazda 626'
    if '323' in t: return 'Mazda 323'
    return 'Mazda Other'


def init_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("window-size=1440,900")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


def save_to_csv(car_data):
    file_exists = os.path.isfile(FILE_PATH)
    with open(FILE_PATH, mode='a', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=car_data.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(car_data)
        f.flush()

def load_scraped_urls():
    scraped_urls = set()
    if os.path.isfile(FILE_PATH):
        with open(FILE_PATH, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'url' in row:
                    scraped_urls.add(row['url'])
    return scraped_urls


def get_car_detail(driver, url, car_id):
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)
        title = wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1"))).text

        try:
            price_raw = driver.find_element(By.XPATH, "//b[contains(text(), 'đ')]").text
        except:
            price_raw = "0"

        def get_item(prop):
            try:
                return driver.find_element(By.CSS_SELECTOR, f"[itemprop='{prop}']").text
            except:
                return "N/A"

        try:
            description = (driver.find_element(By.CSS_SELECTOR, "[itemprop='description']")
                           .text.replace("\n"," ").strip())
        except:
            description = "N/A"

        car_data = {
            "car_id": car_id,
            "title": title,
            "model": extract_mazda_model(title),
            "price_million": clean_price_to_million(price_raw),
            "description": description,

            "odo": get_item("mileage_v2").replace(".", ""),
            "registration": get_item("valid_registration"),
            "origin": get_item("carorigin"),
            "condition": get_item("condition_ad"),
            "warranty": get_item("veh_warranty_policy"),

            "year": get_item("mfdate"),
            "version": get_item("option"),
            "gearbox": get_item("gearbox"),
            "fuel": get_item("fuel"),
            "body_type": get_item("cartype"),
            "seats": get_item("carseats"),
            "drivetrain": get_item("drivetrain"),
            "horse_power": get_item("horse_power"),
            "torque": get_item("torque"),
            "engine_capacity": get_item("engine_capacity"),
            "fuel_consumption": get_item("kml_combined"),
            "airbags": get_item("air_bag"),
            "ground_clearance": get_item("minimum_ground_clearance"),
            "doors": get_item("doors"),
            "unladen_weight": get_item("veh_unladen_weight"),
            "gross_weight": get_item("veh_gross_weight"),

            "image_folder": f"car_{car_id}",
            "url": url
        }

        car_folder_path = os.path.join(IMAGE_ROOT, car_data["image_folder"])
        os.makedirs(car_folder_path, exist_ok=True)

        thumbnails = driver.find_elements(By.CSS_SELECTOR, ".pzvfhqt")
        img_urls = set()
        for i in range(min(len(thumbnails), 10)):
            try:
                driver.execute_script("arguments[0].click();", thumbnails[i])
                time.sleep(0.4)
                visible_imgs = driver.find_elements(By.CSS_SELECTOR, ".slick-track img")
                for img in visible_imgs:
                    src = img.get_attribute("src")
                    if src and "cdn.chotot.com" in src:
                        img_urls.add(
                            src.replace("preset:listing", "preset:view").replace("preset:thumbnail", "preset:view"))
            except:
                continue

        for idx, link in enumerate(list(img_urls)):
            try:
                res = requests.get(link, timeout=10)
                with open(os.path.join(car_folder_path, f"img_{idx}.jpg"), "wb") as f:
                    f.write(res.content)
            except:
                pass

        save_to_csv(car_data)
        return True
    except Exception as e:
        print(f"Lỗi khi cào dữ liệu xe tại {url}: {e}")
        return False


def main():
    driver = init_driver()
    base_search_url = CHOTOT_MAZDA_BASE_URL
    current_page = 70
    max_pages = 80

    scraped_urls = load_scraped_urls()
    print(f"Đã tải {len(scraped_urls)} bài viết cũ. Sẽ tự động bỏ qua nếu trùng.")

    while current_page <= max_pages:
        print(f"Đang cào trang {current_page}...")
        driver.get(f"{base_search_url}?page={current_page}")
        time.sleep(4)

        for _ in range(3):
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(1)

        links = [el.get_attribute("href") for el in driver.find_elements(By.CSS_SELECTOR, "a.c15fd2pn")]
        links = list(dict.fromkeys([l for l in links if l]))

        for i, link in enumerate(links):
            if link in scraped_urls:
                print(f"Bỏ qua (đã có): {link}")
                continue

            unique_id = f"p{current_page}_s{i}_{int(time.time())}"
            print(f"Đang cào dữ liệu: {link}")
            success = get_car_detail(driver, link, unique_id)
            if success:
                scraped_urls.add(link)
            time.sleep(2)

        current_page += 1

    driver.quit()

if __name__ == "__main__":
    main()