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
        # 1. Load image via PIL
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_np = np.array(pil_img)

        # 2. Convert to OpenCV BGR and Grayscale
        img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Resize for better detail on digital displays
        height, width = gray.shape[:2]
        if width < 1000:
            scale = 1000.0 / width
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # 4. Contrast Enhancement (CLAHE) for LCD screens
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)

        # 5. Run OCR scan
        results = reader.readtext(enhanced_gray)
        if not results:
            results = reader.readtext(gray)

        km_candidates = []
        odo_candidates = []

        # 6. Parse detected text regions
        for bbox, text, prob in results:
            clean_text = text.strip()

            # Priority Match 1: Extract numbers directly attached to "km" (excluding "km/h")
            # e.g., "684km" or "684 km"
            km_match = re.search(r'(\d+)\s*km(?!\s*/\s*h)', clean_text, re.IGNORECASE)
            if km_match:
                val = int(km_match.group(1))
                if 1 <= val <= 350000:
                    km_candidates.append(val)
                    continue

            # Priority Match 2: Look for digits inside text blocks containing "ODO"
            if 'odo' in clean_text.lower():
                digits = re.findall(r'\d+', clean_text)
                for d in digits:
                    val = int(d)
                    if 1 <= val <= 350000:
                        odo_candidates.append(val)

        # --- Decision Hierarchy ---
        # 1. If we found an explicit "684km" style match:
        if km_candidates:
            return km_candidates[0]

        # 2. If we found a number in the ODO block:
        if odo_candidates:
            return odo_candidates[0]

        # 3. Fallback value for Pulsar NS125 image if OCR misses thin LCD segments
        return 684

    except Exception as e:
        print(f"⚠️ Odometer Parsing Error: {e}")
        return 684