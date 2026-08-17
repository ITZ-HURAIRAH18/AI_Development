from app.schemas.prediction import WaitingTimeRequest
from app.services.ml_service import ml_service

# Feature order must match the order used to train waiting_time_model.pkl
# queue_length, patients_ahead, consultation_duration, doctor_load, room_available
FEATURE_ORDER = [
    "queue_length",
    "patients_ahead",
    "consultation_duration",
    "doctor_load",
    "room_available",
]


def build_feature_vector(
    queue_length: int,
    patients_ahead: int,
    consultation_duration: int,
    doctor_load: float,
    room_available: int,
) -> list[float]:
    return [
        float(queue_length),
        float(patients_ahead),
        float(consultation_duration),
        float(doctor_load),
        float(room_available),
    ]


def predict_waiting_time(request: WaitingTimeRequest) -> float:
    features = build_feature_vector(
        queue_length=request.queue_length,
        patients_ahead=request.patients_ahead,
        consultation_duration=request.consultation_duration,
        doctor_load=request.doctor_load,
        room_available=request.room_available,
    )
    return ml_service.predict_waiting_time(features, FEATURE_ORDER)
