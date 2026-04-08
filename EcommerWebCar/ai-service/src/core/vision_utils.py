import cv2
import numpy as np
import base64
from typing import Optional
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def convert_to_base64(img_array: Optional[np.ndarray]) -> Optional[str]:
    try:
        if img_array is None:
            return None

        if img_array.dtype != np.uint8:
            img_array = np.uint8(img_array)

        if len(img_array.shape) == 3 and img_array.shape[-1] == 3:
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            img_bgr = img_array

        _, buffer = cv2.imencode('.jpg', img_bgr)
        return base64.b64encode(buffer).decode('utf-8')

    except Exception as e:
        logging.error(e)
        return None

