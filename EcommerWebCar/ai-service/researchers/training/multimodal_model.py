import ssl

ssl._create_default_https_context = ssl._create_unverified_context

import tensorflow as tf
from tensorflow.keras import layers, models


def create_multimodal_model(input_shape_img=(224, 224, 3), num_metadata_features=4):
    #1. Hinh anh
    base_model = tf.keras.applications.EfficientNetB0(
        input_shape=input_shape_img, include_top=False, weights='imagenet'
    )
    base_model.trainable = False

    img_input = layers.Input(shape=input_shape_img, name="image_input")
    x_img = base_model(img_input)
    x_img = layers.GlobalAveragePooling2D()(x_img)
    x_img = layers.Dense(128, activation='relu')(x_img)

    #2. Thong so
    meta_input = layers.Input(shape=(num_metadata_features,), name="meta_input")
    x_meta = layers.Dense(64, activation='relu')(meta_input)
    x_meta = layers.Dense(32, activation='relu')(x_meta)

    #3. Mo ta
    text_input = layers.Input(shape=(100,), name="text_input")
    x_text = layers.Dense(64, activation='relu')(text_input)

    #Hop nhat 3 lop lai
    combined = layers.concatenate([x_img, x_meta, x_text])

    #Dau ra
    z = layers.Dense(128, activation="relu")(combined)
    z = layers.Dense(64, activation="relu")(z)

    price_output = layers.Dense(1, activation="linear", name="price_output")(z)

    model = models.Model(inputs=[img_input, meta_input, text_input], outputs=price_output)

    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model


if __name__ == "__main__":
    model = create_multimodal_model()
    model.summary()