import os
import cv2
import numpy as np
from PIL import Image

def inspect_battery_condition(image_path: str) -> dict:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    # Use PIL to support .webp, .avif, .jpg, .png
    try:
        pil_img = Image.open(image_path).convert('RGB')
        img = np.array(pil_img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise ValueError(f"Could not open image: {e}")

    # HSV Rust Masking
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_rust = np.array([5, 50, 50])
    upper_rust = np.array([25, 255, 255])
    rust_mask = cv2.inRange(hsv, lower_rust, upper_rust)
    rust_ratio = (np.count_nonzero(rust_mask) / rust_mask.size) * 100

    # Edge detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_ratio = (np.count_nonzero(edges) / edges.size) * 100

    if rust_ratio > 15.0 or edge_ratio > 20.0:
        condition = "Heavy Rust / Casing Damage"
        multiplier = 0.70
        eligible_for_resale = False
    elif rust_ratio > 5.0 or edge_ratio > 12.0:
        condition = "Minor Surface Oxidation"
        multiplier = 0.90
        eligible_for_resale = True
    else:
        condition = "Good Physical Condition"
        multiplier = 1.00
        eligible_for_resale = True

    return {
        "condition": condition,
        "multiplier": multiplier,
        "rust_percentage": round(rust_ratio, 1),
        "eligible_for_resale": eligible_for_resale
    }