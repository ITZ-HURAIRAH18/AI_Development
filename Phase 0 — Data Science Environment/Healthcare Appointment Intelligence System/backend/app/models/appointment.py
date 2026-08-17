from datetime import datetime
from typing import Optional

from app.models import MongoModel


class Appointment(MongoModel):
    appointment_id: str
    patient_id: str
    doctor_id: str
    clinic_id: str
    scheduled_day: datetime
    appointment_day: datetime
    status: str = "Scheduled"
    sms_received: int = 0
    queue_length: int = 0
    patients_ahead: int = 0
    consultation_duration: int = 20
    doctor_load: float = 0.0
    room_available: int = 1
    waiting_time: Optional[float] = None
