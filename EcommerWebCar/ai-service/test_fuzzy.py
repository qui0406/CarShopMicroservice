import os
import joblib
import re

transformers_dir = "/Users/anhqui/Documents/CarShopMicroservice/EcommerWebCar/ai-service/model/transformers"
ohe = joblib.load(os.path.join(transformers_dir, "ohe_categorical.pkl"))

def fuzzy_match(val: str, valid_classes: list) -> str:
    def normalize(s):
        return re.sub(r'[\s\-\_]', '', str(s).lower())
        
    val_norm = normalize(val)
    
    # 1. Exact normalized match
    for cls in valid_classes:
        if normalize(cls) == val_norm:
            return cls
            
    # 2. Substring match on normalized strings
    candidates = [cls for cls in valid_classes if val_norm in normalize(cls) or normalize(cls) in val_norm]
    if candidates:
        return max(candidates, key=lambda c: len(str(c)))
        
    return val # fallback

print("Test fuzzy match 'Santafe':", fuzzy_match("Santafe", ohe.categories_[1]))
print("Test fuzzy match 'Cao cấp nhất':", fuzzy_match("Cao cấp nhất", ohe.categories_[2]))
