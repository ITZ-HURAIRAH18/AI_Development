from datetime import datetime

from app.schemas.prediction import NoShowRequest
from app.services.ml_service import ml_service

# Feature order must match the order and names used to train no_show_model.pkl
# Age, Scholarship, Hipertension, Diabetes, Alcoholism, Handcap,
# SMS_received, waiting_days, appointment_day, appointment_month, appointment_hour
FEATURE_ORDER = [
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
    "appointment_hour",
]


def compute_waiting_days(scheduled_day: datetime, appointment_day: datetime) -> int:
    return (appointment_day.date() - scheduled_day.date()).days


def build_feature_vector(
    age: int,
    scholarship: int,
    hypertension: int,
    diabetes: int,
    alcoholism: int,
    handicap: int,
    sms_received: int,
    scheduled_day: datetime,
    appointment_day: datetime,
) -> list[float]:
    waiting_days = compute_waiting_days(scheduled_day, appointment_day)
    if waiting_days < 0:
        raise ValueError("Appointment date cannot be before the scheduled date")

    return [
        float(age),
        float(scholarship),
        float(hypertension),
        float(diabetes),
        float(alcoholism),
        float(handicap),
        float(sms_received),
        float(waiting_days),
        float(appointment_day.weekday()),
        float(appointment_day.month),
        float(appointment_day.hour),
    ]


def risk_level_for_probability(probability: float) -> str:
    if probability >= 0.7:
        return "HIGH"
    if probability >= 0.4:
        return "MEDIUM"
    return "LOW"


def predict_no_show(request: NoShowRequest) -> tuple[float, str]:
    features = build_feature_vector(
        age=request.age,
        scholarship=request.scholarship,
        hypertension=request.hypertension,
        diabetes=request.diabetes,
        alcoholism=request.alcoholism,
        handicap=request.handicap,
        sms_received=request.sms_received,
        scheduled_day=request.scheduled_day,
        appointment_day=request.appointment_day,
    )
    probability = ml_service.predict_no_show(features, FEATURE_ORDER)
    risk = risk_level_for_probability(probability)
    return probability, risk
