from typing import List

from app.models import MongoModel


class Clinic(MongoModel):
    clinic_id: str
    name: str
    location: str = ""
    doctor_ids: List[str] = []
