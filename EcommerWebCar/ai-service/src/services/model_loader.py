import os
import logging
import joblib
import tensorflow as tf

logger = logging.getLogger(__name__)

_HERE = os.path.dirname(os.path.abspath(__file__))

# src/services/ -> root -> models/
_BASE_MODEL_PATH   = os.path.join(_HERE, "..", "..", "models")
_TRANSFORMERS_PATH = os.path.join(_BASE_MODEL_PATH, "transformers")

price_model  = None
scaler       = None
tfidf        = None
le_model     = None
le_fuel      = None
le_body_type = None
le_color     = None
le_gearbox   = None
le_origin    = None
le_version   = None

_loaded = False


def load_all() -> None:
    global price_model, scaler, tfidf, le_model, le_fuel
    global le_body_type, le_color, le_gearbox, le_origin, le_version, _loaded

    if _loaded:
        return

    _load(name="price_model", path=os.path.join(_BASE_MODEL_PATH,   "car_price_model.keras"),         loader_fn=_load_keras)
    _load(name="scaler",      path=os.path.join(_TRANSFORMERS_PATH, "scaler_numeric.pkl"),             loader_fn=_load_pickle)
    _load(name="tfidf",       path=os.path.join(_TRANSFORMERS_PATH, "tfidf_vectorizer.pkl"),           loader_fn=_load_pickle)
    _load(name="le_model",    path=os.path.join(_TRANSFORMERS_PATH, "le_model.pkl"),                   loader_fn=_load_pickle)
    _load(name="le_fuel",     path=os.path.join(_TRANSFORMERS_PATH, "le_fuel.pkl"),                    loader_fn=_load_pickle)
    _load(name="le_body_type",path=os.path.join(_TRANSFORMERS_PATH, "le_body_type_clean.pkl"),         loader_fn=_load_pickle)
    _load(name="le_color",    path=os.path.join(_TRANSFORMERS_PATH, "le_exterior_color.pkl"),          loader_fn=_load_pickle)
    _load(name="le_gearbox",  path=os.path.join(_TRANSFORMERS_PATH, "le_gearbox.pkl"),                 loader_fn=_load_pickle)
    _load(name="le_origin",   path=os.path.join(_TRANSFORMERS_PATH, "le_origin_clean.pkl"),            loader_fn=_load_pickle)
    _load(name="le_version",  path=os.path.join(_TRANSFORMERS_PATH, "le_version_extracted.pkl"),       loader_fn=_load_pickle)

    _loaded = True


def is_ready() -> bool:
    return price_model is not None


def _load(name: str, path: str, loader_fn) -> None:
    global price_model, scaler, tfidf, le_model, le_fuel
    global le_body_type, le_color, le_gearbox, le_origin, le_version

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
