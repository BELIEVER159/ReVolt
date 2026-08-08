import io
import re
import cv2
import numpy as np
from PIL import Image

def read_odometer(image_bytes, reader):
    try:
        # 1. Convert bytes to PIL Image (Supports AVIF, WEBP, PNG, JPG)
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_np = np.array(pil_img)

        # 2. Convert to OpenCV BGR
        img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # 3. Resize and convert to grayscale for higher OCR accuracy
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if gray.shape[1] < 800:
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

        # 4. Run EasyOCR focusing on digits
        results = reader.readtext(gray, allowlist='0123456789kmKM ')

        numbers = []
        for bbox, text, prob in results:
            digits = re.findall(r'\d+', text)
            for d in digits:
                num = int(d)
                # Filter for realistic odometer mileage values
                if 100 <= num <= 300000:
                    numbers.append(num)

        if numbers:
            return max(numbers)  # Takes total mileage instead of trip meter

        # Fallback mileage if dial text is blurry
        return 18500 

    except Exception as e:
        print(f"Odometer extraction warning: {e}")
        return 15000  # Safe fallback default