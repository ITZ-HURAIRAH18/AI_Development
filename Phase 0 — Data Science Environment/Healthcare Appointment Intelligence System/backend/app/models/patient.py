from datetime import datetime

from app.models import MongoModel


class Patient(MongoModel):
    patient_id: str
    name: str
    age: int
    gender: str
    neighbourhood: str = ""
    created_at: datetime = datetime.utcnow()
