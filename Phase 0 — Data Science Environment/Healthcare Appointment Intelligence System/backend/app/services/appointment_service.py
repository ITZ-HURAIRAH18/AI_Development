from datetime import datetime, timedelta
from typing import Any, List, Optional

from app.models import serialize_doc
from app.models.serializers import aggregate_to_list, count_documents, find_to_list
from app.schemas.appointment import AppointmentResponse

# Risk thresholds derived from scheduling_risk_service for filter purposes
RISK_LEVELS = {"LOW", "MEDIUM", "HIGH"}


def _status_from_no_show(value: str) -> str:
    return "No-show" if value and value.strip().lower() == "yes" else "Completed"


def appointment_response_from_doc(doc: dict) -> dict:
    return {
        "id": doc.get("id", ""),
        "appointment_id": doc.get("appointment_id", ""),
        "patient_id": doc.get("patient_id", ""),
        "doctor_id": doc.get("doctor_id", ""),
        "clinic_id": doc.get("clinic_id", ""),
        "scheduled_day": doc.get("scheduled_day"),
        "appointment_day": doc.get("appointment_day"),
        "status": doc.get("status", "Scheduled"),
        "sms_received": doc.get("sms_received", 0),
        "queue_length": doc.get("queue_length", 0),
        "patients_ahead": doc.get("patients_ahead", 0),
        "consultation_duration": doc.get("consultation_duration", 20),
        "doctor_load": doc.get("doctor_load", 0.0),
        "room_available": doc.get("room_available", 1),
        "waiting_time": doc.get("waiting_time"),
    }


async def _predictions_by_appointments(db, appointment_ids: List[str]) -> dict[str, dict]:
    if not appointment_ids:
        return {}
    from bson import ObjectId

    oids = [ObjectId(aid) for aid in appointment_ids if aid]
    docs = await find_to_list(db["predictions"], {"appointment_id": {"$in": appointment_ids}})
    result = {}
    for doc in docs:
        result[doc.get("appointment_id", "")] = doc
    return result


async def list_appointments(
    db,
    search: str = "",
    clinic_id: str = "",
    doctor_id: str = "",
    risk: str = "",
    status: str = "",
    start_date: str = "",
    end_date: str = "",
    page: int = 1,
    limit: int = 20,
    sort_by: str = "appointment_day",
    sort_order: str = "desc",
) -> dict:
    query: dict[str, Any] = {}

    if clinic_id:
        query["clinic_id"] = clinic_id
    if doctor_id:
        query["doctor_id"] = doctor_id
    if status:
        query["status"] = status
    if start_date or end_date:
        query["appointment_day"] = {}
        if start_date:
            query["appointment_day"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            query["appointment_day"]["$lte"] = datetime.fromisoformat(end_date) + timedelta(days=1) - timedelta(microseconds=1)

    if search:
        query["$or"] = [
            {"appointment_id": {"$regex": search, "$options": "i"}},
            {"patient_id": {"$regex": search, "$options": "i"}},
        ]

    risk_limited_ids = None
    if risk:
        risk_query = {"scheduling_risk": risk.upper()}
        risk_docs = await find_to_list(db["predictions"], risk_query)
        risk_limited_ids = {doc.get("appointment_id") for doc in risk_docs if doc.get("appointment_id")}
        query["_id"] = {"$in": []}

    total = await count_documents(db["appointments"], query)

    if risk_limited_ids is not None:
        from bson import ObjectId

        oids = []
        for aid in risk_limited_ids:
            try:
                oids.append(ObjectId(aid))
            except Exception:
                continue
        query["_id"] = {"$in": oids}
        total = await count_documents(db["appointments"], query)

    sort = [(sort_by, 1 if sort_order == "asc" else -1)]
    docs = await find_to_list(db["appointments"], query, sort=sort, limit=limit)

    items = []
    prediction_map = await _predictions_by_appointments(db, [d.get("id", "") for d in docs])
    for doc in docs:
        item = appointment_response_from_doc(doc)
        pred = prediction_map.get(item["id"], {})
        item["no_show_probability"] = pred.get("no_show_probability")
        item["no_show_risk"] = pred.get("no_show_risk")
        item["scheduling_risk"] = pred.get("scheduling_risk")
        item["risk_score"] = pred.get("risk_score")
        item["risk_factors"] = pred.get("risk_factors", [])
        items.append(item)

    return {"items": items, "total": total, "page": page, "limit": limit}


async def get_appointment_detail(db, appointment_object_id: str) -> Optional[dict]:
    from bson import ObjectId

    try:
        oid = ObjectId(appointment_object_id)
    except Exception:
        return None

    doc = await db["appointments"].find_one({"_id": oid})
    if not doc:
        return None

    appointment = appointment_response_from_doc(serialize_doc(doc))

    patient = await db["patients"].find_one({"_id": ObjectId(appointment["patient_id"])})
    doctor = await db["doctors"].find_one({"doctor_id": appointment["doctor_id"]})
    clinic = await db["clinics"].find_one({"clinic_id": appointment["clinic_id"]})
    prediction = await db["predictions"].find_one({"appointment_id": appointment["id"]})

    def public(d):
        if not d:
            return None
        d = serialize_doc(d)
        d.pop("password_hash", None)
        return d

    return {
        **appointment,
        "patient": public(patient),
        "doctor": public(doctor),
        "clinic": public(clinic),
        "prediction": serialize_doc(prediction) if prediction else None,
    }
