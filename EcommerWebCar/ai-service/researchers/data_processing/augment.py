import os
import tensorflow as tf
from researchers.experiments.tools.data_loader import load_multimodal_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "model", "car_price_model.keras")
SAVE_PATH = os.path.join(BASE_DIR, "model", "car_price_model_refined.keras")

def refine_vision_learning():
    if not os.path.exists(MODEL_PATH):
        return

    model = tf.keras.models.load_model(MODEL_PATH)

    efficientnet_backbone = None
    for layer in model.layers:
        if 'efficientnet' in layer.name.lower():
            efficientnet_backbone = layer
            break

    if efficientnet_backbone:
        efficientnet_backbone.trainable = True
        for layer in efficientnet_backbone.layers[:-10]:
            layer.trainable = False

    optimizer = tf.keras.optimizers.Adam(learning_rate=1e-6)
    model.compile(optimizer=optimizer, loss='mae', metrics=['mae'])

    result = load_multimodal_data()
    if result is None: return
    imgs, metas, texts, prices = result

    #Neu thay overfitting thi ngung
    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor='mae',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )

    model.fit(
        [imgs, metas, texts], prices,
        epochs=30,
        batch_size=8,
        callbacks=[early_stop],
        verbose=1
    )

    model.save(SAVE_PATH)

if __name__ == "__main__":
    refine_vision_learning()