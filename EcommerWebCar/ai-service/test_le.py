import joblib
import pandas as pd

def check_le(name, filename):
    try:
        le = joblib.load(filename)
        print(f"{name}: {le.classes_}")
    except:
        pass

print("Label Encoder Classes:")
check_le("model", "model/transformers/le_model.pkl")
check_le("version_extracted", "model/transformers/le_version_extracted.pkl")
check_le("gearbox", "model/transformers/le_gearbox.pkl")
check_le("fuel", "model/transformers/le_fuel.pkl")
check_le("body_type_clean", "model/transformers/le_body_type_clean.pkl")
check_le("origin_clean", "model/transformers/le_origin_clean.pkl")
check_le("exterior_color", "model/transformers/le_exterior_color.pkl")
