import joblib 
scaler = joblib.load('model/transformers/scaler_numeric.pkl')
print("Scaler feature names:", getattr(scaler, 'feature_names_in_', None))
print("Scaler data min:", scaler.data_min_)
print("Scaler data max:", scaler.data_max_)
print("Scaler scale:", scaler.scale_)
