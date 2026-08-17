import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# =========================
# 1. Load Dataset
# =========================

df = pd.read_csv("clinic_operations.csv")


# =========================
# 2. Features
# =========================

features = [
    "queue_length",
    "patients_ahead",
    "consultation_duration",
    "doctor_load",
    "room_available"
]

X = df[features]
y = df["waiting_time"]


# =========================
# 3. Train/Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


# =========================
# 4. Create Model
# =========================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)


# =========================
# 5. Train
# =========================

print("Training waiting-time model...")

model.fit(X_train, y_train)

print("Training completed!")


# =========================
# 6. Prediction
# =========================

predictions = model.predict(X_test)


# =========================
# 7. Evaluation
# =========================

mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)

print("\n--- Waiting Time Model ---")

print("MAE :", mae)
print("RMSE:", rmse)
print("R²  :", r2)


# =========================
# 8. Save Model
# =========================

joblib.dump(
    model,
    "waiting_time_model.pkl"
)

print("\nModel saved as: waiting_time_model.pkl")