import sys
import os
import logging
import numpy as np
import matplotlib.pyplot as plt

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from multimodal_model import create_multimodal_model
from data_loader import load_multimodal_data

MODEL_SAVE_PATH = os.path.join(ROOT_DIR, "model", "car_price_model1.keras")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def train_model():
    result = load_multimodal_data()
    if result is None:
        logger.error("Không load được dữ liệu.")
        return None

    (imgs_train, meta_train, text_train, prices_train), \
    (imgs_val,   meta_val,   text_val,   prices_val) = result

    n_train, n_val = len(prices_train), len(prices_val)
    logger.info(f"Train: {n_train} mẫu | Val: {n_val} mẫu")
    logger.info(
        f"Giá train (triệu): "
        f"min={np.expm1(prices_train.min()):.0f}  "
        f"max={np.expm1(prices_train.max()):.0f}  "
        f"median={np.expm1(np.median(prices_train)):.0f}"
    )

    model = create_multimodal_model(
        input_shape_img=(224, 224, 3),
        num_metadata_features=meta_train.shape[1]
    )

    model.compile(
        optimizer=Adam(learning_rate=3e-4),
        loss=tf.keras.losses.Huber(delta=0.5),
        metrics=['mae']
    )

    EPOCHS     = 120
    BATCH_SIZE = 16

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='val_mae',
        save_best_only=True,
        mode='min',
        verbose=0
    )

    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor='val_mae',
        patience=25,
        restore_best_weights=True,
        verbose=1,
        mode='min',
    )

    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_mae',
        factor=0.5,
        patience=10,
        min_lr=1e-6,
        mode='min',
        verbose=1
    )

    try:
        history = model.fit(
            x=[imgs_train, meta_train, text_train],
            y=prices_train,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            validation_data=(
                [imgs_val, meta_val, text_val],
                prices_val
            ),
            callbacks=[checkpoint, early_stopping, reduce_lr],
            verbose=1,
            shuffle=True
        )
        return history
    except Exception as e:
        logger.error(f"Lỗi khi training: {e}", exc_info=True)
        return None


if __name__ == "__main__":
    history = train_model()

    if history:
        mae      = history.history['mae']
        val_mae  = history.history['val_mae']
        loss     = history.history['loss']
        val_loss = history.history['val_loss']
        epochs_range = range(1, len(mae) + 1)

        best_epoch = int(np.argmin(val_mae)) + 1
        best_val   = min(val_mae)
        print(f"\n Best val MAE (log-space): {best_val:.4f}  (epoch {best_epoch})")

        plt.figure(figsize=(14, 5))

        plt.subplot(1, 2, 1)
        plt.plot(epochs_range, mae,     label='Train MAE')
        plt.plot(epochs_range, val_mae, label='Val MAE')
        plt.title('MAE (log-space)')
        plt.xlabel('Epoch')
        plt.ylabel('MAE')
        plt.legend()
        plt.grid(alpha=0.3)

        plt.subplot(1, 2, 2)
        plt.plot(epochs_range, loss,     label='Train Loss')
        plt.plot(epochs_range, val_loss, label='Val Loss')
        plt.title('Huber Loss (log-space)')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        plt.grid(alpha=0.3)

        plt.tight_layout()
        plot_path = os.path.join(ROOT_DIR, "model", "training_curve.png")
        plt.savefig(plot_path, dpi=150)
        print(f"Biểu đồ lưu tại: {plot_path}")
        plt.show()