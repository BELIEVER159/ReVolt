import os
import pickle
import shutil
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel

# Imports for Vision ML Modules
from battery_inspector import inspect_battery_condition
from odometer_reader import extract_mileage

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load SOH Regression Model
MODEL_PATH = "soh_model.pkl"
try:
  with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)
  print("Successfully loaded soh_model.pkl!")
except Exception as e:
  print(f"Error loading model: {e}")
  model = None


class SOHRequest(BaseModel):
  age_years: float
  mileage_km: float
  capacity_kwh: float
  condition_multiplier: float = 1.0


# 1. Main Valuation Endpoint
@app.post("/api/predict-soh")
def predict_soh(data: SOHRequest):
  if model is None:
    raise HTTPException(status_code=500, detail="Model file not loaded")

  features = np.array([[data.age_years, data.mileage_km, data.capacity_kwh]])
  predicted_soh = float(model.predict(features)[0])
  predicted_soh = round(max(0, min(100, predicted_soh)), 1)

  estimated_original_val = data.capacity_kwh * 5000
  base_offer = estimated_original_val * (predicted_soh / 100) * 0.45
  adjusted_offer = round(base_offer * data.condition_multiplier)

  return {
      "predicted_soh": predicted_soh,
      "eligible": predicted_soh >= 70,
      "recommended_action": (
          "Resale for Home Solar Backup / Off-Grid"
          if predicted_soh >= 70
          else "Send to Battery Cell Recycler"
      ),
      "buyback_offer_inr": adjusted_offer,
  }


# 2. Non-blocking Odometer OCR Scanner Endpoint
@app.post("/api/predict-from-odometer")
async def predict_from_odometer(file: UploadFile = File(...)):
  temp_filename = f"temp_odo_{file.filename}"
  try:
    with open(temp_filename, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

    # Run CPU-heavy OCR function inside a threadpool executor so it doesn't freeze FastAPI
    mileage_km = await run_in_threadpool(extract_mileage, temp_filename)

    if os.path.exists(temp_filename):
      os.remove(temp_filename)

    return {"success": True, "extracted_mileage_km": mileage_km}
  except Exception as e:
    if os.path.exists(temp_filename):
      os.remove(temp_filename)
    return {"success": False, "error": str(e)}


# 3. Battery Casing Damage Inspection Endpoint
@app.post("/api/inspect-battery-photo")
async def inspect_battery_photo(file: UploadFile = File(...)):
  temp_filename = f"temp_bat_{file.filename}"
  try:
    with open(temp_filename, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

    inspection = await run_in_threadpool(
        inspect_battery_condition, temp_filename
    )

    if os.path.exists(temp_filename):
      os.remove(temp_filename)

    return {"success": True, "inspection": inspection}
  except Exception as e:
    if os.path.exists(temp_filename):
      os.remove(temp_filename)
    return {"success": False, "error": str(e)}