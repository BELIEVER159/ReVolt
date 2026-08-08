
import pickle
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Create sample battery training data [Age (yrs), Mileage (km), Capacity (kWh)] -> SOH (%)
X = np.array([
    [1, 10000, 30],
    [2, 20000, 30],
    [3, 35000, 30],
    [4, 45000, 30],
    [5, 60000, 30],
    [2, 15000, 40],
    [4, 50000, 40],
    [6, 75000, 40],
    [1, 8000, 3.5],
    [3, 25000, 3.5],
])

y = np.array([96.0, 91.5, 85.0, 78.2, 70.0, 93.0, 80.0, 68.5, 97.0, 86.0])

# Train Random Forest Regressor
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Save valid soh_model.pkl
with open("soh_model.pkl", "wb") as f:
  pickle.dump(model, f)

print("✅ Successfully generated a clean soh_model.pkl file!")