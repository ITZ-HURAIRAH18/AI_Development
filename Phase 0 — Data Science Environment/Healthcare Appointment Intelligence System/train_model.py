import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier


# =========================
# 1. Load Dataset
# =========================

df = pd.read_csv("clinic_operations.csv")


# =========================
# 2. Convert Dates
# =========================

df["ScheduledDay"] = pd.to_datetime(df["ScheduledDay"])
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])


# =========================
# 3. Create Waiting Days
# =========================

df["waiting_days"] = (
    df["AppointmentDay"].dt.normalize()
    - df["ScheduledDay"].dt.normalize()
).dt.days


# =========================
# 4. Clean Data
# =========================

df = df[df["Age"] >= 0]
df = df[df["waiting_days"] >= 0]


# =========================
# 5. Feature Engineering
# =========================

df["appointment_day"] = df["AppointmentDay"].dt.dayofweek
df["appointment_month"] = df["AppointmentDay"].dt.month
df["appointment_hour"] = df["AppointmentDay"].dt.hour


# =========================
# 6. Target
# =========================

df["No-show"] = df["No-show"].map({
    "No": 0,
    "Yes": 1
})


# =========================
# 7. Select Features
# =========================

features = [
    "Age",
    "Scholarship",
    "Hipertension",
    "Diabetes",
    "Alcoholism",
    "Handcap",
    "SMS_received",
    "waiting_days",
    "appointment_day",
    "appointment_month",
    "appointment_hour"
]

X = df[features]
y = df["No-show"]


# =========================
# 8. Train/Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# =========================
# 9. Create XGBoost Model
# =========================

model = XGBClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42
)


# =========================
# 10. Train Model
# =========================

print("Training XGBoost model...")

model.fit(X_train, y_train)

print("Training completed!")


# =========================
# 11. Save Model
# =========================

joblib.dump(
    model,
    "no_show_model.pkl"
)

print("Model saved as: no_show_model.pkl")