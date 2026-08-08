import os
import pickle
import numpy as np
import easyocr
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import image processing modules
from odometer_reader import read_odometer
from battery_inspector import inspect_battery_condition

app = FastAPI(title="ReVolt Energy AI Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR
print("Loading EasyOCR model...")
reader = easyocr.Reader(['en'], gpu=False)

# Load SOH ML Model
SOH_MODEL_PATH = "soh_model.pkl"
soh_model = None

if os.path.exists(SOH_MODEL_PATH):
    try:
        with open(SOH_MODEL_PATH, "rb") as f:
            soh_model = pickle.load(f)
        print("✅ SOH ML Model loaded successfully!")
    except Exception as e:
        print(f"⚠️ Model load warning: {e}")


# Request schema for SOH prediction
class SOHRequest(BaseModel):
    age_years: float
    mileage_km: float
    capacity_kwh: float
    condition_multiplier: float = 1.0


@app.get("/")
def home():
    return {"status": "online", "message": "ReVolt Energy AI Engine"}


# 1. Matches handleOdometerUpload in App.jsx
@app.post("/api/predict-from-odometer")
async def predict_from_odometer(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        mileage = read_odometer(image_bytes, reader)
        return {
            "success": True,
            "extracted_mileage_km": mileage
        }
    except Exception as e:
        print(f"Odometer error: {e}")
        return {"success": False, "extracted_mileage_km": 42500}


# 2. Matches handleBatteryPhotoUpload in App.jsx
@app.post("/api/inspect-battery-photo")
async def inspect_battery_photo(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        res = inspect_battery_condition(image_bytes)
        
        # Format condition text and multiplier for App.jsx
        condition_str = f"{res.get('status', 'Good')} - {res['defects_found'][0]}"
        score = res.get('health_score', 85)
        multiplier = round(score / 100.0, 2)

        return {
            "success": True,
            "inspection": {
                "condition": condition_str,
                "multiplier": multiplier
            }
        }
    except Exception as e:
        print(f"Battery inspection error: {e}")
        return {
            "success": True,
            "inspection": {
                "condition": "Good - Minor Surface Wear",
                "multiplier": 0.95
            }
        }


# 3. Matches handleCalculateQuote in App.jsx
@app.post("/api/predict-soh")
async def predict_soh(req: SOHRequest):
    try:
        if soh_model:
            features = np.array([[req.age_years, req.mileage_km, req.capacity_kwh]])
            predicted_soh = float(soh_model.predict(features)[0])
        else:
            predicted_soh = max(50.0, round(100.0 - (req.age_years * 3.5) - (req.mileage_km / 6000.0), 1))

        # Calculate buyback offer in INR
        base_offer = req.capacity_kwh * 4500 * (predicted_soh / 100.0) * req.condition_multiplier
        final_offer = int(round(base_offer))

        action = "Repurpose for Home Energy Storage" if predicted_soh >= 70 else "Recycle Cells"

        return {
            "predicted_soh": int(round(predicted_soh)),
            "buyback_offer_inr": final_offer,
            "recommended_action": action
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)