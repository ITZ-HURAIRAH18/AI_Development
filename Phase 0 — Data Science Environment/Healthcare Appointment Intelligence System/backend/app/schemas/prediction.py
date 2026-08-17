from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class NoShowRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(M|F)$")
    scholarship: int = Field(0, ge=0, le=1)
    hypertension: int = Field(0, ge=0, le=1)
    diabetes: int = Field(0, ge=0, le=1)
    alcoholism: int = Field(0, ge=0, le=1)
    handicap: int = Field(0, ge=0, le=4)
    sms_received: int = Field(0, ge=0, le=1)
    scheduled_day: datetime
    appointment_day: datetime


class WaitingTimeRequest(BaseModel):
    queue_length: int = Field(..., ge=0)
    patients_ahead: int = Field(..., ge=0)
    consultation_duration: int = Field(..., ge=1, le=240)
    doctor_load: float = Field(..., ge=0.0, le=1.0)
    room_available: int = Field(..., ge=0, le=1)


class NoShowResponse(BaseModel):
    probability: float
    risk: str


class WaitingTimeResponse(BaseModel):
    expected_waiting_time: float


class FullPredictionRequest(BaseModel):
    no_show: NoShowRequest
    operational: WaitingTimeRequest
    appointment_id: Optional[str] = None


class FullPredictionResponse(BaseModel):
    no_show_probability: float
    no_show_risk: str
    expected_waiting_time: float
    scheduling_risk: str
    risk_score: int
    risk_factors: List[str]


class PredictionHistoryResponse(BaseModel):
    id: str
    appointment_id: Optional[str]
    no_show_probability: float
    no_show_risk: str
    expected_waiting_time: float
    scheduling_risk: str
    risk_score: int
    risk_factors: List[str]
    created_at: datetime
