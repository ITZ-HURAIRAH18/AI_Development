from typing import Optional

from app.models.serializers import aggregate_to_list, find_to_list
from app.services.utilization_service import compute_clinic_utilization


async def list_clinics(db) -> list[dict]:
    clinics = await find_to_list(db["clinics"], {}, sort=[("clinic_id", 1)])
    utilization = {u["clinic_id"]: u for u in await compute_clinic_utilization(db)}

    items = []
    for clinic in clinics:
        stats = utilization.get(clinic.get("clinic_id", ""), {})
        doctors = await db["doctors"].count_documents({"clinic_id": clinic.get("clinic_id")})
        items.append(
            {
                "id": clinic.get("id", ""),
                "clinic_id": clinic.get("clinic_id", ""),
                "name": clinic.get("name", ""),
                "location": clinic.get("location", ""),
                "doctors": doctors,
                "appointments": stats.get("patient_volume", 0),
                "utilization": stats.get("utilization_percentage", 0.0),
                "average_waiting_time": stats.get("average_waiting_time", 0.0),
                "no_show_rate": stats.get("no_show_rate", 0.0),
            }
        )
    return items


async def get_clinic_detail(db, clinic_object_id: str) -> Optional[dict]:
    from bson import ObjectId

    try:
        oid = ObjectId(clinic_object_id)
    except Exception:
        return None

    doc = await db["clinics"].find_one({"_id": oid})
    if not doc:
        return None

    clinic_id = doc.get("clinic_id")
    stats = (await compute_clinic_utilization(db, clinic_id=clinic_id)) or [{}]
    stats = stats[0] if stats else {}

    doctors = await find_to_list(db["doctors"], {"clinic_id": clinic_id}, sort=[("doctor_id", 1)])

    # Risk distribution for the clinic
    from app.models.serializers import serialize_doc
    from bson import ObjectId as BsonObjectId

    risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    appointment_ids = [a["id"] for a in await find_to_list(
        db["appointments"], {"clinic_id": clinic_id}
    )]
    if appointment_ids:
        bucket = await aggregate_to_list(
            db["predictions"],
            [
                {"$match": {"appointment_id": {"$in": appointment_ids}}},
                {"$group": {"_id": "$scheduling_risk", "count": {"$sum": 1}}},
            ],
        )
        for row in bucket:
            risk_distribution[row.get("_id", "")] = row.get("count", 0)

    detail = {
        "id": str(doc["_id"]),
        "clinic_id": clinic_id,
        "name": doc.get("name", ""),
        "location": doc.get("location", ""),
        "doctors": doctors,
        "appointments": stats.get("patient_volume", 0),
        "utilization": stats.get("utilization_percentage", 0.0),
        "average_waiting_time": stats.get("average_waiting_time", 0.0),
        "no_show_rate": stats.get("no_show_rate", 0.0),
        "average_doctor_load": stats.get("average_doctor_load", 0.0),
        "total_consultation_minutes": stats.get("total_consultation_minutes", 0),
        "risk_distribution": risk_distribution,
    }
    return detail
