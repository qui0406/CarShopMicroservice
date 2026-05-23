import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import tensorflow as tf
from tensorflow.keras import layers, models


def create_multimodal_model(input_shape_img=(224, 224, 3), num_metadata_features=17):
    # Tải base model EfficientNetB0 (đóng băng trọng số)
    base_model = tf.keras.applications.EfficientNetB0(
        input_shape=input_shape_img, include_top=False, weights='imagenet'
    )
    base_model.trainable = False

    # 1. Nhánh Hình Ảnh (Vision Branch) - Loại bỏ hoàn toàn Dropout và GaussianNoise
    img_input = layers.Input(shape=input_shape_img, name="image_input")
    x_img = base_model(img_input, training=False)
    x_img = layers.GlobalAveragePooling2D()(x_img)
    x_img = layers.BatchNormalization()(x_img)
    x_img = layers.Dense(128, activation='relu')(x_img)
    x_img = layers.BatchNormalization()(x_img)

    # 2. Nhánh Đặc trưng Bảng (Tabular Branch) - Loại bỏ hoàn toàn Dropout
    meta_input = layers.Input(shape=(num_metadata_features,), name="meta_input")
    x_meta = layers.Dense(128, activation='relu')(meta_input)
    x_meta = layers.BatchNormalization()(x_meta)
    x_meta = layers.Dense(64, activation='relu')(x_meta)
    x_meta = layers.BatchNormalization()(x_meta)

    # 3. Nhánh Mô tả Văn Bản (Text Branch) - Loại bỏ hoàn toàn Dropout
    text_input = layers.Input(shape=(100,), name="text_input")
    x_text = layers.Dense(64, activation='relu')(text_input)
    x_text = layers.BatchNormalization()(x_text)
    x_text = layers.Dense(32, activation='relu')(x_text)
    x_text = layers.BatchNormalization()(x_text)

    # 4. Hợp nhất (Concatenation) và Khối liên kết sâu - Loại bỏ hoàn toàn Dropout và L2 Penalty
    combined = layers.concatenate([x_img, x_meta, x_text])

    z = layers.Dense(256, activation='relu')(combined)
    z = layers.BatchNormalization()(z)
    z = layers.Dense(128, activation='relu')(z)
    z = layers.BatchNormalization()(z)
    z = layers.Dense(64, activation='relu')(z)
    z = layers.BatchNormalization()(z)

    # Lớp đầu ra dự báo giá xe (Linear trong không gian log)
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