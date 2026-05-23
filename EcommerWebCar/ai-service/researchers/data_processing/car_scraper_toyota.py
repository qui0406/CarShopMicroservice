import os
import time
import csv
import re
import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ── Paths ────────────────────────────────────────────────────────────────────
CURRENT_FILE_PATH = os.path.abspath(__file__)
PROJECT_ROOT      = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_FILE_PATH)))
RAW_DATA_DIR      = os.path.join(PROJECT_ROOT, "data", "raw", "car_details")
IMAGE_ROOT        = os.path.join(PROJECT_ROOT, "data", "raw", "images_toyota")
FILE_PATH         = os.path.join(RAW_DATA_DIR, "toyota_full_dataset.csv")

os.makedirs(RAW_DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_ROOT,   exist_ok=True)

CHOTOT_TOYOTA_BASE_URL = "https://xe.chotot.com/mua-ban-oto-toyota-sdcb2"

# ── Tuning knobs ─────────────────────────────────────────────────────────────
NUM_WORKERS      = 3   # số Chrome driver song song (tăng lên 4-5 nếu RAM đủ)
IMAGE_THREADS    = 8   # số thread tải ảnh song song mỗi xe
PAGE_LOAD_WAIT   = 3   # giây chờ sau khi mở trang list
DETAIL_TIMEOUT   = 10  # giây WebDriverWait cho trang chi tiết
BETWEEN_CARS     = 1   # giây nghỉ giữa mỗi xe (giảm rủi ro bị block)

# ── Thread-safe CSV writer ────────────────────────────────────────────────────
_csv_lock = threading.Lock()

def save_to_csv(car_data: dict):
    with _csv_lock:
        file_exists = os.path.isfile(FILE_PATH)
        with open(FILE_PATH, mode='a', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=car_data.keys())
            if not file_exists:
                writer.writeheader()
            writer.writerow(car_data)
            f.flush()

def load_scraped_urls() -> set:
    scraped = set()
    if os.path.isfile(FILE_PATH):
        with open(FILE_PATH, encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                if 'url' in row:
                    scraped.add(row['url'])
    return scraped

# ── Helpers ───────────────────────────────────────────────────────────────────
def clean_price_to_million(price_str):
    try:
        if not price_str or 'Thỏa thuận' in price_str:
            return 0
        return round(int(re.sub(r'[^\d]', '', price_str)) / 1_000_000, 2)
    except:
        return 0

def extract_toyota_model(title):
    t = title.upper()
    if 'LAND CRUISER PRADO' in t or 'LC PRADO' in t:  return 'Land Cruiser Prado'
    if 'LAND CRUISER' in t or 'LANDCRUISER' in t:     return 'Land Cruiser'
    if 'FORTUNER' in t:                                return 'Fortuner'
    if 'INNOVA CROSS' in t:                            return 'Innova Cross'
    if 'INNOVA' in t:                                  return 'Innova'
    if 'CAMRY' in t:                                   return 'Camry'
    if 'COROLLA CROSS' in t:                           return 'Corolla Cross'
    if 'COROLLA ALTIS' in t or 'ALTIS' in t:           return 'Corolla Altis'
    if 'COROLLA' in t:                                 return 'Corolla'
    if 'VIOS' in t:                                    return 'Vios'
    if 'YARIS CROSS' in t:                             return 'Yaris Cross'
    if 'YARIS' in t:                                   return 'Yaris'
    if 'RUSH' in t:                                    return 'Rush'
    if 'RAV4' in t or 'RAV 4' in t:                   return 'RAV4'
    if 'VELOZ CROSS' in t:                             return 'Veloz Cross'
    if 'VELOZ' in t:                                   return 'Veloz'
    if 'AVANZA' in t:                                  return 'Avanza'
    if 'HILUX' in t or 'HI-LUX' in t:                 return 'Hilux'
    if 'ALPHARD' in t:                                 return 'Alphard'
    if 'SIENNA' in t:                                  return 'Sienna'
    if 'HIGHLANDER' in t:                              return 'Highlander'
    if 'PRIUS' in t:                                   return 'Prius'
    if 'CHR' in t or 'C-HR' in t:                     return 'C-HR'
    if 'WIGO' in t:                                    return 'Wigo'
    if 'HIACE' in t or 'HI-ACE' in t:                 return 'Hiace'
    return 'Toyota Other'

# ── Driver factory ────────────────────────────────────────────────────────────
def init_driver() -> webdriver.Chrome:
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("window-size=1440,900")
    # TỐI ƯU 1: tắt ảnh trong Chrome để tiết kiệm bandwidth khi scrape metadata
    # (ảnh vẫn tải riêng qua requests bên dưới)
    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return driver

# ── Image downloader (parallel) ───────────────────────────────────────────────
# TỐI ƯU 2: tải nhiều ảnh cùng lúc thay vì tuần tự
def download_images(img_urls: set, folder: str):
    os.makedirs(folder, exist_ok=True)

    def fetch(args):
        idx, url = args
        try:
            r = requests.get(url, timeout=10)
            with open(os.path.join(folder, f"img_{idx}.jpg"), "wb") as f:
                f.write(r.content)
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=IMAGE_THREADS) as pool:
        pool.map(fetch, enumerate(img_urls))

# ── Single car scraper ─────────────────────────────────────────────────────────
def get_car_detail(driver: webdriver.Chrome, url: str, car_id: str) -> bool:
    try:
        driver.get(url)
        wait = WebDriverWait(driver, DETAIL_TIMEOUT)
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
                           .text.replace("\n", " ").strip())
        except:
            description = "N/A"

        car_data = {
            "car_id":           car_id,
            "title":            title,
            "model":            extract_toyota_model(title),
            "price_million":    clean_price_to_million(price_raw),
            "description":      description,
            "odo":              get_item("mileage_v2").replace(".", ""),
            "registration":     get_item("valid_registration"),
            "origin":           get_item("carorigin"),
            "condition":        get_item("condition_ad"),
            "warranty":         get_item("veh_warranty_policy"),
            "year":             get_item("mfdate"),
            "version":          get_item("option"),
            "gearbox":          get_item("gearbox"),
            "fuel":             get_item("fuel"),
            "body_type":        get_item("cartype"),
            "seats":            get_item("carseats"),
            "drivetrain":       get_item("drivetrain"),
            "horse_power":      get_item("horse_power"),
            "torque":           get_item("torque"),
            "engine_capacity":  get_item("engine_capacity"),
            "fuel_consumption": get_item("kml_combined"),
            "airbags":          get_item("air_bag"),
            "ground_clearance": get_item("minimum_ground_clearance"),
            "doors":            get_item("doors"),
            "unladen_weight":   get_item("veh_unladen_weight"),
            "gross_weight":     get_item("veh_gross_weight"),
            "image_folder":     f"toyota_{car_id}",
            "url":              url,
        }

        # Collect image URLs
        img_urls = set()
        thumbnails = driver.find_elements(By.CSS_SELECTOR, ".pzvfhqt")
        for i in range(min(len(thumbnails), 10)):
            try:
                driver.execute_script("arguments[0].click();", thumbnails[i])
                time.sleep(0.3)  # giảm từ 0.4 xuống 0.3
                for img in driver.find_elements(By.CSS_SELECTOR, ".slick-track img"):
                    src = img.get_attribute("src")
                    if src and "cdn.chotot.com" in src:
                        img_urls.add(
                            src.replace("preset:listing", "preset:view")
                               .replace("preset:thumbnail", "preset:view")
                        )
            except:
                continue

        # TỐI ƯU 2: tải ảnh song song
        car_folder = os.path.join(IMAGE_ROOT, car_data["image_folder"])
        download_images(img_urls, car_folder)

        save_to_csv(car_data)
        return True

    except Exception as e:
        print(f"[ERROR] {url}: {e}")
        return False

# ── Worker: xử lý một batch URL với một driver riêng ─────────────────────────
# TỐI ƯU 3: mỗi worker có driver riêng, chạy song song
def worker_run(worker_id: int, urls: list) -> int:
    driver = init_driver()
    success_count = 0
    try:
        for url, car_id in urls:
            print(f"[Worker {worker_id}] Cào: {url}")
            ok = get_car_detail(driver, url, car_id)
            if ok:
                success_count += 1
            time.sleep(BETWEEN_CARS)
    finally:
        driver.quit()
    return success_count

# ── Page collector: dùng 1 driver riêng để lấy danh sách link ────────────────
def collect_all_links(max_pages: int) -> list[str]:
    driver = init_driver()
    all_links = []
    try:
        for page in range(1, max_pages + 1):
            print(f"[Collector] Đang lấy trang {page}...")
            driver.get(f"{CHOTOT_TOYOTA_BASE_URL}?page={page}")
            time.sleep(PAGE_LOAD_WAIT)

            for _ in range(3):
                driver.execute_script("window.scrollBy(0, 1000);")
                time.sleep(0.8)

            links = [
                el.get_attribute("href")
                for el in driver.find_elements(By.CSS_SELECTOR, "a.c15fd2pn")
            ]
            links = list(dict.fromkeys(l for l in links if l))
            all_links.extend(links)
            print(f"[Collector] Trang {page}: {len(links)} link")
    finally:
        driver.quit()
    return list(dict.fromkeys(all_links))  # dedup toàn bộ

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    max_pages = 80

    # Bước 1: thu thập toàn bộ URL trước
    print("=== Bước 1: Thu thập URL ===")
    all_links = collect_all_links(max_pages)
    scraped_urls = load_scraped_urls()

    new_links = [(url, f"id_{i}_{int(time.time())}")
                 for i, url in enumerate(all_links)
                 if url not in scraped_urls]

    print(f"Tổng mới cần cào: {len(new_links)} / {len(all_links)}")

    if not new_links:
        print("Không có link mới. Kết thúc.")
        return

    # Bước 2: chia đều cho NUM_WORKERS workers
    print(f"\n=== Bước 2: Cào song song với {NUM_WORKERS} workers ===")
    chunk_size = (len(new_links) + NUM_WORKERS - 1) // NUM_WORKERS
    batches = [new_links[i:i + chunk_size] for i in range(0, len(new_links), chunk_size)]

    total_ok = 0
    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as pool:
        futures = {
            pool.submit(worker_run, wid, batch): wid
            for wid, batch in enumerate(batches)
        }
        for future in as_completed(futures):
            wid = futures[future]
            try:
                ok = future.result()
                total_ok += ok
                print(f"[Worker {wid}] Hoàn thành: {ok} xe")
            except Exception as e:
                print(f"[Worker {wid}] Lỗi: {e}")

    print(f"\n✅ Xong! Đã cào thành công {total_ok} xe.")

if __name__ == "__main__":
    main()