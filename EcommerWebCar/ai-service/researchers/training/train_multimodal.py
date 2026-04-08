import sys
import os
import logging

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from multimodal_model import create_multimodal_model
from data_loader import load_multimodal_data

MODEL_SAVE_PATH = os.path.join(ROOT_DIR, "model", "car_price_model.keras")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def train_model():
    result = load_multimodal_data()
    if result is None:
        return
    imgs, metas, texts, prices = result

    model = create_multimodal_model(input_shape_img=(224, 224, 3), num_metadata_features=11)
    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='mae',
        metrics=['mae']
    )
    EPOCHS = 100
    BATCH_SIZE = 4

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='mae',
        save_best_only=True,
        mode='min',
        verbose=1
    )

    try:
        history = model.fit(
            x=[imgs, metas, texts],
            y=prices,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            callbacks=[checkpoint],
            verbose=1
        )
        return history
    except Exception as e:
        logger.error(e)
        return None


if __name__ == "__main__":
    train_model()