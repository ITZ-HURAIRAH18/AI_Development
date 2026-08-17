from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class MongoModel(BaseModel):
    id: Optional[str] = None

    @classmethod
    def from_document(cls, doc: Optional[dict]) -> Optional["MongoModel"]:
        if not doc:
            return None
        doc = dict(doc)
        oid = doc.pop("_id", None)
        doc["id"] = str(oid) if oid is not None else None
        return cls(**doc)


def serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict with _id -> id."""
    if not doc:
        return {}
    doc = dict(doc)
    oid = doc.pop("_id", None)
    doc["id"] = str(oid) if oid is not None else None
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc


def to_document(obj: BaseModel, exclude: set[str] | None = None) -> dict[str, Any]:
    data = obj.model_dump(exclude_unset=False)
    if exclude:
        for field in exclude:
            data.pop(field, None)
    data.pop("id", None)
    return data
