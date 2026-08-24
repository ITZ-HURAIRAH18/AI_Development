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
    skip = (page - 1) * limit
    docs = await find_to_list(db["patients"], query, sort=sort, skip=skip, limit=limit)

    patient_ids = [d.get("id", "") for d in docs if d.get("id")]

    # Bulk aggregate patient stats for all page patients in 1 Mongo query
    stats_map = {}
    if patient_ids:
        pipeline = [
            {"$match": {"patient_id": {"$in": patient_ids}}},
            {"$sort": {"appointment_day": -1}},
            {
                "$group": {
                    "_id": "$patient_id",
                    "appointments": {"$sum": 1},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                    "last_appointment": {"$first": "$appointment_day"},
                }
            },
        ]
        stats_rows = await aggregate_to_list(db["appointments"], pipeline)
        for r in stats_rows:
            p_id = r.get("id")
            count = r.get("appointments", 0)
            no_shows = r.get("no_shows", 0)
            no_show_rate = round((no_shows / count) * 100, 1) if count else 0.0
            last_app = r.get("last_appointment")
            if isinstance(last_app, datetime):
                last_app = last_app.isoformat()
            stats_map[p_id] = {
                "appointments": count,
                "no_show_rate": no_show_rate,
                "last_appointment": last_app,
                "risk_status": _risk_from_rate(no_show_rate),
            }

    items = []
    for doc in docs:
        patient = patient_response_from_doc(doc)
        stats = stats_map.get(patient["id"], {
            "appointments": 0,
            "no_show_rate": 0.0,
            "last_appointment": None,
            "risk_status": "LOW",
        })
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

    last_appointment = last.get("appointment_day") if last else None
    if isinstance(last_appointment, datetime):
        last_appointment = last_appointment.isoformat()

    return {
        "appointments": count,
        "no_show_rate": no_show_rate,
        "last_appointment": last_appointment,
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
