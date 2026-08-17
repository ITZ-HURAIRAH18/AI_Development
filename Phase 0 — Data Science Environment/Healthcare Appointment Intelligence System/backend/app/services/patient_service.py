from datetime import datetime
from typing import Any, Optional

from app.models.serializers import aggregate_to_list, count_documents, find_to_list
from app.models.patient import Patient


def patient_response_from_doc(doc: dict) -> dict:
    return {
        "id": doc.get("id", ""),
        "patient_id": doc.get("patient_id", ""),
        "name": doc.get("name", ""),
        "age": doc.get("age", 0),
        "gender": doc.get("gender", ""),
        "neighbourhood": doc.get("neighbourhood", ""),
        "created_at": doc.get("created_at"),
    }


def _risk_from_rate(no_show_rate: float) -> str:
    if no_show_rate >= 40:
        return "HIGH"
    if no_show_rate >= 20:
        return "MEDIUM"
    return "LOW"


async def list_patients(
    db,
    search: str = "",
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    query: dict[str, Any] = {}
    if search:
        from bson import ObjectId

        try:
            oid = ObjectId(search)
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"patient_id": {"$regex": search, "$options": "i"}},
                {"_id": oid},
            ]
        except Exception:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"patient_id": {"$regex": search, "$options": "i"}},
            ]

    total = await count_documents(db["patients"], query)
    sort = [(sort_by, 1 if sort_order == "asc" else -1)]
    docs = await find_to_list(db["patients"], query, sort=sort, limit=limit)

    items = []
    for doc in docs:
        patient = patient_response_from_doc(doc)
        stats = await _patient_stats(db, patient["id"])
        patient.update(stats)
        items.append(patient)

    return {"items": items, "total": total, "page": page, "limit": limit}


async def _patient_stats(db, patient_object_id: str) -> dict:
    appointments_coll = db["appointments"]

    count = await appointments_coll.count_documents({"patient_id": patient_object_id})
    no_shows = await appointments_coll.count_documents(
        {"patient_id": patient_object_id, "status": "No-show"}
    )
    no_show_rate = round((no_shows / count) * 100, 1) if count else 0.0

    last = await appointments_coll.find_one(
        {"patient_id": patient_object_id}, sort=[("appointment_day", -1)]
    )

    return {
        "appointments": count,
        "no_show_rate": no_show_rate,
        "last_appointment": last.get("appointment_day") if last else None,
        "risk_status": _risk_from_rate(no_show_rate),
    }


async def get_patient_detail(db, patient_id: str) -> Optional[dict]:
    from bson import ObjectId

    try:
        oid = ObjectId(patient_id)
    except Exception:
        return None

    doc = await db["patients"].find_one({"_id": oid})
    if not doc:
        return None

    patient = patient_response_from_doc({"id": str(doc["_id"]), **doc})
    stats = await _patient_stats(db, patient["id"])
    patient.update(stats)

    history = await aggregate_to_list(
        db["appointments"],
        [
            {"$match": {"patient_id": patient["id"]}},
            {"$sort": {"appointment_day": -1}},
            {"$limit": 50},
        ],
    )
    patient["history"] = history

    return patient
