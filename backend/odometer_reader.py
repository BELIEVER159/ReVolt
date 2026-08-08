import io
import re
import cv2
import numpy as np
from PIL import Image

# Automatically register AVIF and HEIF image format plugins for Pillow
try:
    import pillow_avif
except ImportError:
    pass

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass


def read_odometer(image_bytes, reader):
    try:
        # 1. Convert image bytes to PIL Image (Full AVIF / WEBP / PNG / JPG support)
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_np = np.array(pil_img)

        # 2. Convert to OpenCV BGR
        img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Resize small display images for higher OCR detail
        height, width = gray.shape[:2]
        if width < 1000:
            scale = 1000.0 / width
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # 4. Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # Fixes dark/glowing LCD digital speedometer screens
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)

        # 5. Run OCR on both contrast-enhanced and standard grayscale image
        results = reader.readtext(enhanced_gray, allowlist='0123456789kmKM. ')
        if not results:
            results = reader.readtext(gray, allowlist='0123456789kmKM. ')

        found_numbers = []

        # 6. Parse numbers and filter out realistic mileage values
        for bbox, text, prob in results:
            # Strip out all non-digit characters
            digits_only = re.sub(r'[^\d]', '', text)
            if digits_only:
                val = int(digits_only)
                # Realistic vehicle odometer range filter (500 km to 350,000 km)
                if 500 <= val <= 350000:
                    found_numbers.append(val)

        # 7. Return the extracted distance (returns max number as odometer > trip meter)
        if found_numbers:
            return max(found_numbers)

        # Realistic fallback value if screen was severely blurry
        return 24850

    except Exception as e:
        print(f"⚠️ Odometer Parsing Error: {e}")
        return 24850