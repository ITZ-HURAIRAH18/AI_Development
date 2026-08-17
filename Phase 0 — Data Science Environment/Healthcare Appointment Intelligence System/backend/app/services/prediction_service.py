import logging
from datetime import datetime
from typing import Any, Optional

from app.schemas.prediction import (
    FullPredictionRequest,
    FullPredictionResponse,
    NoShowRequest,
    WaitingTimeRequest,
)
from app.services.ml_service import ml_service
from app.services.no_show_service import predict_no_show
from app.services.scheduling_risk_service import calculate_scheduling_risk
from app.services.waiting_time_service import predict_waiting_time

logger = logging.getLogger("healthcare-intelligence")


def run_full_prediction(
    no_show: NoShowRequest,
    operational: WaitingTimeRequest,
) -> FullPredictionResponse:
    """Run the no-show model, waiting-time model, and scheduling risk logic."""
    no_show_probability, no_show_risk = predict_no_show(no_show)
    expected_waiting_time = predict_waiting_time(operational)

    risk, score, factors = calculate_scheduling_risk(
        no_show_probability=no_show_probability,
        waiting_time=expected_waiting_time,
        doctor_load=operational.doctor_load,
        queue_length=operational.queue_length,
        room_available=operational.room_available,
    )

    return FullPredictionResponse(
        no_show_probability=round(no_show_probability, 4),
        no_show_risk=no_show_risk,
        expected_waiting_time=round(expected_waiting_time, 2),
        scheduling_risk=risk,
        risk_score=score,
        risk_factors=factors,
    )


async def store_prediction(
    db,
    appointment_id: Optional[str],
    result: FullPredictionResponse,
) -> dict[str, Any]:
    """Persist a prediction document to the predictions collection."""
    doc = {
        "appointment_id": appointment_id,
        "no_show_probability": result.no_show_probability,
        "no_show_risk": result.no_show_risk,
        "expected_waiting_time": result.expected_waiting_time,
        "scheduling_risk": result.scheduling_risk,
        "risk_score": result.risk_score,
        "risk_factors": result.risk_factors,
        "created_at": datetime.utcnow(),
    }
    inserted = await db["predictions"].insert_one(doc)
    doc["id"] = str(inserted.inserted_id)
    return doc


async def compute_and_store_prediction(db, appointment_doc: dict) -> dict[str, Any]:
    """Build NoShowRequest / WaitingTimeRequest from an appointment document and run + store prediction."""
    no_show = NoShowRequest(
        age=appointment_doc.get("age", 0),
        gender=appointment_doc.get("gender", "M"),
        scholarship=appointment_doc.get("scholarship", 0),
        hypertension=appointment_doc.get("hypertension", 0),
        diabetes=appointment_doc.get("diabetes", 0),
        alcoholism=appointment_doc.get("alcoholism", 0),
        handicap=appointment_doc.get("handicap", 0),
        sms_received=appointment_doc.get("sms_received", 0),
        scheduled_day=appointment_doc.get("scheduled_day"),
        appointment_day=appointment_doc.get("appointment_day"),
    )
    operational = WaitingTimeRequest(
        queue_length=appointment_doc.get("queue_length", 0),
        patients_ahead=appointment_doc.get("patients_ahead", 0),
        consultation_duration=appointment_doc.get("consultation_duration", 20),
        doctor_load=appointment_doc.get("doctor_load", 0.0),
        room_available=appointment_doc.get("room_available", 1),
    )
    result = run_full_prediction(no_show, operational)
    stored = await store_prediction(db, str(appointment_doc["_id"]), result)
    return stored
