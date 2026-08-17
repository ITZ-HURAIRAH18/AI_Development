from datetime import datetime

from app.models import MongoModel


class User(MongoModel):
    name: str
    email: str
    password_hash: str
    role: str = "staff"
    created_at: datetime = datetime.utcnow()
