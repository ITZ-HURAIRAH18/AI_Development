from typing import Optional

from app.models import MongoModel


class Doctor(MongoModel):
    doctor_id: str
    name: str
    clinic_id: str
    specialization: str = "General Practice"
    active: bool = True


class DoctorStats(MongoModel):
    doctor_id: str
    clinic_id: str
    name: str
    specialization: str
    appointments: int = 0
    average_waiting_time: float = 0.0
    doctor_load: float = 0.0
    no_show_rate: float = 0.0
    utilization: float = 0.0
    active: Optional[bool] = True
