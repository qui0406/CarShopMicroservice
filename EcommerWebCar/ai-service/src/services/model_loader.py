import os
import logging
import joblib
import tensorflow as tf

logger = logging.getLogger(__name__)

_HERE = os.path.dirname(os.path.abspath(__file__))

# src/services/ -> root -> models/
_BASE_MODEL_PATH   = os.path.join(_HERE, "..", "..", "model")
_TRANSFORMERS_PATH = os.path.join(_BASE_MODEL_PATH, "transformers")

price_model  = None
scaler       = None
tfidf        = None
le_brand     = None
ohe          = None

_loaded = False


def load_all() -> None:
    global price_model, scaler, tfidf, ohe, _loaded

    if _loaded:
        return

    print("Loading model...")

    _load(name="price_model", path=os.path.join(_BASE_MODEL_PATH,   "car_price_model1.keras"),         loader_fn=_load_keras)
    _load(name="scaler",      path=os.path.join(_TRANSFORMERS_PATH, "scaler_numeric.pkl"),             loader_fn=_load_pickle)
    _load(name="tfidf",       path=os.path.join(_TRANSFORMERS_PATH, "tfidf_vectorizer.pkl"),           loader_fn=_load_pickle)
    _load(name="ohe",         path=os.path.join(_TRANSFORMERS_PATH, "ohe_categorical.pkl"),            loader_fn=_load_pickle)

    _loaded = True

    print("Model loaded.")


def is_ready() -> bool:
    return price_model is not None


def _load(name: str, path: str, loader_fn) -> None:
    global price_model, scaler, tfidf, ohe

    if not os.path.exists(path):
        logger.warning(f"File không tồn tại: {path}")
        return

    try:
        obj = loader_fn(path)
        globals()[name] = obj
    except Exception as e:
        logger.error(e)


def _load_keras(path: str):
    return tf.keras.models.load_model(path)


def _load_pickle(path: str):
    return joblib.load(path)
