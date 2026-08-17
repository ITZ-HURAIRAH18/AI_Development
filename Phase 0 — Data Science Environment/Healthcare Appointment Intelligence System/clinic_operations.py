import pandas as pd
import numpy as np

# Load your Kaggle dataset
df = pd.read_csv("appointments.csv")

# Make results reproducible
np.random.seed(42)

# Number of appointments
n = len(df)

# -----------------------------
# 1. Doctor ID
# -----------------------------
df["doctor_id"] = np.random.choice(
    [f"D{i:03d}" for i in range(1, 21)],  # 20 doctors
    size=n
)

# -----------------------------
# 2. Clinic ID
# -----------------------------
df["clinic_id"] = np.random.choice(
    [f"C{i:02d}" for i in range(1, 6)],   # 5 clinics
    size=n
)

# -----------------------------
# 3. Queue length
# -----------------------------
df["queue_length"] = np.random.poisson(
    lam=4,
    size=n
)

# -----------------------------
# 4. Patients ahead
# -----------------------------
df["patients_ahead"] = np.maximum(
    0,
    df["queue_length"] - np.random.randint(0, 3, size=n)
)

# -----------------------------
# 5. Check-in time
# -----------------------------
# Convert appointment date
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# Patient checks in 5-30 minutes before/after appointment
check_in_offset = np.random.randint(
    -10, 31, size=n
)

df["check_in_time"] = (
    df["AppointmentDay"]
    + pd.to_timedelta(check_in_offset, unit="m")
)

# -----------------------------
# 6. Consultation duration
# -----------------------------
df["consultation_duration"] = np.random.normal(
    loc=20,
    scale=5,
    size=n
).clip(5, 60).round().astype(int)

# -----------------------------
# 7. Doctor load
# -----------------------------
df["doctor_load"] = (
    df["queue_length"] / 10
).clip(0, 1).round(2)

# -----------------------------
# 8. Room available
# -----------------------------
df["room_available"] = np.random.choice(
    [0, 1],
    size=n,
    p=[0.15, 0.85]
)

# -----------------------------
# 9. Waiting time
# -----------------------------
df["waiting_time"] = (
    df["patients_ahead"] *
    df["consultation_duration"] *
    0.7
    + np.random.normal(5, 3, n)
).clip(0, 180).round().astype(int)

# Save synthetic operational dataset
df.to_csv(
    "clinic_operations.csv",
    index=False
)

print(df[
    [
        "doctor_id",
        "clinic_id",
        "queue_length",
        "patients_ahead",
        "check_in_time",
        "consultation_duration",
        "doctor_load",
        "room_available",
        "waiting_time"
    ]
].head())