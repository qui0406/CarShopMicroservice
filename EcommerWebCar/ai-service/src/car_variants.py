"""
car_variants.py
───────────────
Danh sách hãng xe và phiên bản (trim) để Frontend hiển thị dropdown.
Thêm xe mới vào CAR_VARIANTS khi showroom nhập thêm hàng.
"""

CAR_VARIANTS: dict[str, list[str]] = {
    "Mazda CX-5": [
        "2.0 Luxury",
        "2.0 Premium",
        "2.0 Premium Exclusive",
        "2.5 Signature Premium AWD",
        "2.5 Turbo AWD",
    ],
    "Mazda 3": [
        "1.5 Luxury",
        "1.5 Sport Luxury",
        "2.0 Premium",
        "2.0 Sport Premium",
    ],
    "Mazda CX-8": [
        "2.5 Luxury",
        "2.5 Premium",
        "2.5 Premium AWD",
        "2.5 Signature Premium AWD",
    ],
    "Hyundai Creta": [
        "1.5 AT Đặc biệt",
        "1.5 AT Tiêu chuẩn",
        "1.5 Turbo CVT Cao cấp",
    ],
    "Hyundai Tucson": [
        "2.0 AT Tiêu chuẩn",
        "2.0 AT Đặc biệt",
        "1.6 Turbo AT Cao cấp",
        "2.0 AT Cao cấp",
    ],
    "Honda CR-V": [
        "1.5L Turbo",
        "1.5L Turbo L",
        "e:HEV RS",
    ],
    "Toyota Camry": [
        "2.0G",
        "2.5Q",
        "2.5HV",
    ],
}


def get_all() -> dict:
    return {"success": True, "variants": CAR_VARIANTS}


def get_trims(model_name: str) -> list[str]:
    return CAR_VARIANTS.get(model_name, [])