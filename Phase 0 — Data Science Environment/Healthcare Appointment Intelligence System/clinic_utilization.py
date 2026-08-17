import pandas as pd

# Load data
df = pd.read_csv("clinic_operations.csv")

# Convert date
df["AppointmentDay"] = pd.to_datetime(df["AppointmentDay"])

# Number of working days
days = df["AppointmentDay"].dt.date.nunique()

# Calculate number of doctors in each clinic
doctors_per_clinic = (
    df.groupby("clinic_id")["doctor_id"]
    .nunique()
    .reset_index(name="number_of_doctors")
)

# Clinic statistics
clinic_data = df.groupby("clinic_id").agg(
    total_consultation_minutes=(
        "consultation_duration",
        "sum"
    ),

    total_patients=(
        "AppointmentID",
        "count"
    ),

    average_waiting_time=(
        "waiting_time",
        "mean"
    ),

    average_doctor_load=(
        "doctor_load",
        "mean"
    )
).reset_index()

# Add number of doctors
clinic_data = clinic_data.merge(
    doctors_per_clinic,
    on="clinic_id"
)

# Assume each doctor works 8 hours/day
working_minutes_per_doctor = 480

# Total available capacity
clinic_data["available_minutes"] = (
    clinic_data["number_of_doctors"]
    * working_minutes_per_doctor
    * days
)

# Utilization
clinic_data["utilization_percentage"] = (
    clinic_data["average_doctor_load"] * 100
)
# Display
print("\n--- Clinic Utilization ---")

print(
    clinic_data[
        [
            "clinic_id",
            "number_of_doctors",
            "total_patients",
            "total_consultation_minutes",
            "available_minutes",
            "average_waiting_time",
            "average_doctor_load",
            "utilization_percentage"
        ]
    ]
)

# Highest utilization
print("\n--- Highest Utilization Clinics ---")

print(
    clinic_data.sort_values(
        "utilization_percentage",
        ascending=False
    ).head(10)
)