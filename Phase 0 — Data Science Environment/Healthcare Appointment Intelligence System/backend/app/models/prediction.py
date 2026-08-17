from datetime import datetime
from typing import List, Optional

from app.models import MongoModel


class Prediction(MongoModel):
    appointment_id: Optional[str] = None
    no_show_probability: float
    no_show_risk: str
    expected_waiting_time: float
    scheduling_risk: str
    risk_score: int
    risk_factors: List[str] = []
    created_at: datetime = datetime.utcnow()
