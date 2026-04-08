import os
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def load_multimodal_data(image_source, metadata_dict: dict):
    try:
        processed_img = None

        if isinstance(image_source, str) and os.path.exists(image_source):
            processed_img = cv2.imread(image_source)
            processed_img = cv2.cvtColor(processed_img, cv2.COLOR_BGR2RGB)

        elif isinstance(image_source, bytes):
            nparr = np.frombuffer(image_source, np.uint8)
            processed_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            processed_img = cv2.cvtColor(processed_img, cv2.COLOR_BGR2RGB)

        elif isinstance(image_source, Image.Image):
            processed_img = np.array(image_source)

        if processed_img is not None:
            processed_img = cv2.resize(processed_img, (224, 224))
            processed_img = processed_img / 255.0

        df_meta = pd.DataFrame([metadata_dict])

        # Điền giá trị mặc định nếu thiếu
        df_meta['year'] = df_meta.get('year', 2020).fillna(2020)
        df_meta['mileage'] = df_meta.get('mileage', 0).fillna(0)

        return processed_img, df_meta.to_dict('records')[0]

    except Exception as e:
        logger.error(e)
        return None, None