from typing import Any, Optional

from app.models.serializers import aggregate_to_list, count_documents, find_to_list
from app.services.utilization_service import compute_doctor_workload


async def list_doctors(db, search: str = "", clinic_id: str = "") -> list[dict]:
    query: dict[str, Any] = {}
    if clinic_id:
        query["clinic_id"] = clinic_id
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"doctor_id": {"$regex": search, "$options": "i"}},
            {"specialization": {"$regex": search, "$options": "i"}},
        ]

    docs = await find_to_list(db["doctors"], query, sort=[("doctor_id", 1)])
    workload_map = {w["doctor_id"]: w for w in await compute_doctor_workload(db, clinic_id=clinic_id or None)}

    items = []
    for doc in docs:
        item = {
            "id": doc.get("id", ""),
            "doctor_id": doc.get("doctor_id", ""),
            "name": doc.get("name", ""),
            "clinic_id": doc.get("clinic_id", ""),
            "specialization": doc.get("specialization", ""),
            "active": doc.get("active", True),
        }
        stats = workload_map.get(item["doctor_id"], {})
        item.update(
            {
                "appointments": stats.get("appointments", 0),
                "average_waiting_time": stats.get("average_waiting_time", 0),
                "doctor_load": stats.get("doctor_load", 0.0),
                "no_show_rate": stats.get("no_show_rate", 0.0),
                "utilization": stats.get("utilization", 0.0),
            }
        )
        items.append(item)

    return items


async def get_doctor_detail(db, doctor_object_id: str) -> Optional[dict]:
    from bson import ObjectId

    try:
        oid = ObjectId(doctor_object_id)
    except Exception:
        return None

    doc = await db["doctors"].find_one({"_id": oid})
    if not doc:
        return None

    doctor_id = doc.get("doctor_id")
    workload = await compute_doctor_workload(db, clinic_id=doc.get("clinic_id"))
    workload_map = {w["doctor_id"]: w for w in workload}

    clinic = await db["clinics"].find_one({"clinic_id": doc.get("clinic_id")})

    detail = {
        "id": str(doc["_id"]),
        "doctor_id": doctor_id,
        "name": doc.get("name", ""),
        "clinic_id": doc.get("clinic_id", ""),
        "specialization": doc.get("specialization", ""),
        "active": doc.get("active", True),
        "clinic_name": clinic.get("name", "") if clinic else "",
        "appointments": 0,
        "average_waiting_time": 0,
        "doctor_load": 0.0,
        "no_show_rate": 0.0,
        "utilization": 0.0,
    }
    stats = workload_map.get(doctor_id, {})
    detail.update({k: stats.get(k, v) for k, v in [
        ("appointments", 0),
        ("average_waiting_time", 0),
        ("doctor_load", 0.0),
        ("no_show_rate", 0.0),
        ("utilization", 0.0),
    ]})

    # Trends: patient volume, waiting time, load over time (by day)
    # Raw accumulators only - $round is not valid inside a $group stage.
    trend_rows = await aggregate_to_list(
        db["appointments"],
        [
            {"$match": {"doctor_id": doctor_id}},
            {
                "$group": {
                    "_id": {
                        "day": {"$dateToString": {"format": "%Y-%m-%d", "date": "$appointment_day"}}
                    },
                    "appointments": {"$sum": 1},
                    "average_waiting_time_raw": {"$avg": "$waiting_time"},
                    "average_doctor_load_raw": {"$avg": "$doctor_load"},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                }
            },
            {"$sort": {"_id.day": 1}},
        ],
    )
    trends = []
    for row in trend_rows:
        # serialize_doc renames "_id" -> "id" and stringifies nested values,
        # so rebuild the { _id: { day } } shape expected by the frontend.
        key = row.get("id")
        if isinstance(key, dict):
            day = key.get("day")
        else:
            day = str(key)
        try:
            avg_wait = round(float(row.get("average_waiting_time_raw")), 1)
        except (TypeError, ValueError):
            avg_wait = 0
        try:
            avg_load = round(float(row.get("average_doctor_load_raw")), 2)
        except (TypeError, ValueError):
            avg_load = 0.0
        trends.append(
            {
                "_id": {"day": day},
                "appointments": row.get("appointments", 0),
                "average_waiting_time": avg_wait,
                "average_doctor_load": avg_load,
                "no_shows": row.get("no_shows", 0),
            }
        )
    detail["trends"] = trends

    return detail
