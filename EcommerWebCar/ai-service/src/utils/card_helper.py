from typing import Any


def normalize_cards(data: Any, intent: str) -> list[dict]:
    if not data or intent == "rolling_price":
        return []
    if isinstance(data, dict):
        return [_build_card(data, intent)]
    if isinstance(data, list):
        return [_build_card(item, intent) for item in data[:10]]
    return []


def _build_card(item: dict, intent: str) -> dict:
    card: dict = {
        "type":            intent,
        "id":              item.get("car_id") or item.get("id", ""),
        "name":            item.get("car_name", item.get("name", "")),
        "price":           _to_int(item.get("price")),
        "price_formatted": item.get("price_formatted", "Lien he"),
        "year":            item.get("year") or item.get("manufacturing_year"),
        "image":           item.get("first_image") or item.get("thumbnail", ""),
        "engine":          item.get("engine", ""),
    }

    if intent == "list_cars":
        card.update({
            "model":     item.get("model_name", ""),
            "body_type": item.get("body_type", ""),
            "fuel_type": item.get("fuel_type", ""),
            "seats":     item.get("seats"),
            "branch":    item.get("branch_name", ""),
            "category":  item.get("category", ""),
        })

    elif intent == "car_detail":
        card.update({
            "model":        item.get("model_name", ""),
            "body_type":    item.get("body_type", ""),
            "fuel_type":    item.get("spec_fuel_type") or item.get("model_fuel_type", ""),
            "seats":        item.get("seats"),
            "branch":       item.get("branch_name", ""),
            "engine":       item.get("engine", ""),
            "horsepower":   _to_float(item.get("horsepower")),
            "transmission": item.get("transmission", ""),
            "top_speed":    _to_float(item.get("top_speed")),
            "images":       item.get("images", []),
            "seat_material":item.get("seat_material", ""),
            "screen_type":  item.get("screen_type", ""),
            "features": {
                "airbags":          bool(item.get("has_airbags")),
                "camera":           bool(item.get("has_camera")),
                "gps":              bool(item.get("has_gps")),
                "smart_key":        bool(item.get("smart_key")),
                "parking_sensor":   bool(item.get("parking_sensor")),
                "lane_keep_assist": bool(item.get("lane_keep_assist")),
                "stability":        bool(item.get("electronic_stability")),
                "sun_roof":         item.get("sun_roof") or False,
                "wireless_charge":  bool(item.get("wireless_charge")),
                "bluetooth":        bool(item.get("has_bluetooth")),
                "electric_trunk":   bool(item.get("electric_trunk")),
            },
        })

    elif intent == "inventory":
        card.update({
            "model":         item.get("model_name", ""),
            "body_type":     item.get("body_type", ""),
            "quantity":      item.get("quantity", 0),
            "showroom_name": item.get("showroom_name", ""),
            "address":       item.get("address", ""),
            "phone":         item.get("phone", ""),
            "zalo":          item.get("zalo", ""),
        })

    elif intent == "showroom_info":
        card.update({
            "address":   item.get("address", ""),
            "phone":     item.get("phone", ""),
            "zalo":      item.get("zalo", ""),
            "email":     item.get("email", ""),
            "facebook":  item.get("facebook", ""),
            "about":     item.get("about", ""),
            "latitude":  _to_float(item.get("latitude")),
            "longitude": _to_float(item.get("longitude")),
        })

    elif intent == "rolling_price":
        card.update({
            "rolling_price":        item.get("rolling_price_detail", {}).get("unit_rolling_price", ""),
            "rolling_price_detail": item.get("rolling_price_detail", {})
        })

    return card


def _to_int(val) -> int | None:
    try:
        return int(float(val)) if val is not None else None
    except (ValueError, TypeError):
        return None


def _to_float(val) -> float | None:
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None