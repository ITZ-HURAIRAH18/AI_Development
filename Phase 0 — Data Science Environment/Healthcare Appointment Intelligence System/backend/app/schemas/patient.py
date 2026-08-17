from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    patient_id: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(M|F)$")
    neighbourhood: str = Field("", max_length=200)


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, pattern="^(M|F)$")
    neighbourhood: Optional[str] = Field(None, max_length=200)


class PatientResponse(BaseModel):
    id: str
    patient_id: str
    name: str
    age: int
    gender: str
    neighbourhood: str
    created_at: datetime


class PatientDetailResponse(PatientResponse):
    appointments: int = 0
    no_show_rate: float = 0.0
    last_appointment: Optional[datetime] = None
    risk_status: str = "LOW"
