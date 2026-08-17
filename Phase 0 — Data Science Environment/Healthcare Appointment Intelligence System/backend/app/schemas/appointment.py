from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    appointment_id: str = Field(..., min_length=1, max_length=64)
    patient_id: str = Field(..., min_length=1)
    doctor_id: str = Field(..., min_length=1)
    clinic_id: str = Field(..., min_length=1)
    scheduled_day: datetime
    appointment_day: datetime
    status: str = Field("Scheduled", pattern="^(Scheduled|Completed|No-show|Cancelled)$")
    sms_received: int = Field(0, ge=0, le=1)
    queue_length: int = Field(0, ge=0)
    patients_ahead: int = Field(0, ge=0)
    consultation_duration: int = Field(20, ge=1, le=240)
    doctor_load: float = Field(0.0, ge=0.0, le=1.0)
    room_available: int = Field(1, ge=0, le=1)
    waiting_time: Optional[float] = Field(None, ge=0.0)


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Scheduled|Completed|No-show|Cancelled)$")


class AppointmentResponse(BaseModel):
    id: str
    appointment_id: str
    patient_id: str
    doctor_id: str
    clinic_id: str
    scheduled_day: datetime
    appointment_day: datetime
    status: str
    sms_received: int
    queue_length: int
    patients_ahead: int
    consultation_duration: int
    doctor_load: float
    room_available: int
    waiting_time: Optional[float] = None


class AppointmentListResponse(BaseModel):
    items: List[AppointmentResponse]
    total: int
    page: int
    limit: int
