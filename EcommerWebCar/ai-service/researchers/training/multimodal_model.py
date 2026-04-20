import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import tensorflow as tf
from tensorflow.keras import layers, models, regularizers


def create_multimodal_model(input_shape_img=(224, 224, 3), num_metadata_features=13):
    l2_reg = regularizers.l2(1e-4)

    base_model = tf.keras.applications.EfficientNetB0(
        input_shape=input_shape_img, include_top=False, weights='imagenet'
    )
    base_model.trainable = False

    img_input = layers.Input(shape=input_shape_img, name="image_input")

    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.05),
        layers.RandomZoom(0.05),
        layers.RandomBrightness(factor=0.15),
        layers.RandomContrast(factor=0.15),
    ], name="data_augmentation")

    x_img = data_augmentation(img_input)
    x_img = base_model(x_img, training=False)
    x_img = layers.GlobalAveragePooling2D()(x_img)
    x_img = layers.GaussianNoise(0.1)(x_img)
    x_img = layers.BatchNormalization()(x_img)
    x_img = layers.Dropout(0.5)(x_img)
    x_img = layers.Dense(64, activation='relu', kernel_regularizer=l2_reg)(x_img)
    x_img = layers.BatchNormalization()(x_img)
    x_img = layers.Dropout(0.4)(x_img)

    meta_input = layers.Input(shape=(num_metadata_features,), name="meta_input")
    x_meta = layers.Dense(64, activation='relu', kernel_regularizer=l2_reg)(meta_input)
    x_meta = layers.BatchNormalization()(x_meta)
    x_meta = layers.Dropout(0.3)(x_meta)
    x_meta = layers.Dense(32, activation='relu', kernel_regularizer=l2_reg)(x_meta)
    x_meta = layers.BatchNormalization()(x_meta)
    x_meta = layers.Dropout(0.2)(x_meta)

    text_input = layers.Input(shape=(100,), name="text_input")
    x_text = layers.Dense(32, activation='relu', kernel_regularizer=l2_reg)(text_input)
    x_text = layers.BatchNormalization()(x_text)
    x_text = layers.Dropout(0.3)(x_text)
    x_text = layers.Dense(16, activation='relu', kernel_regularizer=l2_reg)(x_text)

    combined = layers.concatenate([x_img, x_meta, x_text])

    z = layers.Dense(128, activation='relu', kernel_regularizer=l2_reg)(combined)
    z = layers.BatchNormalization()(z)
    z = layers.Dropout(0.4)(z)
    z = layers.Dense(64, activation='relu', kernel_regularizer=l2_reg)(z)
    z = layers.BatchNormalization()(z)
    z = layers.Dropout(0.3)(z)

    price_output = layers.Dense(1, activation='linear', name="price_output")(z)

    model = models.Model(
        inputs=[img_input, meta_input, text_input],
        outputs=price_output
    )
    return model


if __name__ == "__main__":
    model = create_multimodal_model()
    model.summary()
    total_params = model.count_params()
    print(f"\nTổng tham số: {total_params:,}")