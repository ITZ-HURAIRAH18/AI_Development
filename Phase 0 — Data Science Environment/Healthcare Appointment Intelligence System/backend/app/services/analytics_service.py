import logging
from datetime import datetime, timedelta
from typing import Any, Optional

from app.models.serializers import aggregate_to_list, count_documents, find_to_list
from app.services.utilization_service import compute_clinic_utilization, compute_doctor_workload

logger = logging.getLogger("healthcare-intelligence")


def _date_range(start: str = "", end: str = "") -> Optional[dict]:
    if not start and not end:
        return None
    date_range: dict[str, Any] = {}
    if start:
        date_range["$gte"] = datetime.fromisoformat(start)
    if end:
        date_range["$lte"] = datetime.fromisoformat(end) + timedelta(days=1) - timedelta(microseconds=1)
    return {"appointment_day": date_range}


def _base_match(clinic_id: str = "", doctor_id: str = "", start: str = "", end: str = "") -> dict:
    match: dict[str, Any] = {}
    if clinic_id:
        match["clinic_id"] = clinic_id
    if doctor_id:
        match["doctor_id"] = doctor_id
    date_filter = _date_range(start, end)
    if date_filter:
        match.update(date_filter)
    return match


async def dashboard_data(db, clinic_id: str = "", start: str = "", end: str = "") -> dict:
    match = _base_match(clinic_id, "", start, end)
    appointments = db["appointments"]
    predictions = db["predictions"]

    total_appointments = await count_documents(appointments, match)

    waiting_result = await aggregate_to_list(
        appointments,
        [{"$match": match}, {"$group": {"_id": None, "avg": {"$avg": "$waiting_time"}, "max": {"$max": "$waiting_time"}}}],
    )
    avg_waiting_time = round(waiting_result[0].get("avg", 0) or 0, 1) if waiting_result else 0

    doctor_load_result = await aggregate_to_list(
        appointments,
        [{"$match": match}, {"$group": {"_id": None, "avg": {"$avg": "$doctor_load"}}}],
    )
    avg_doctor_load = round((doctor_load_result[0].get("avg", 0) or 0), 2) if doctor_load_result else 0

    # Predicted no-shows and high risk come from the predictions collection
    predicted_no_shows = await count_documents(
        predictions, {"no_show_probability": {"$gte": 0.5}}
    )
    high_risk = await count_documents(predictions, {"scheduling_risk": "HIGH"})

    clinic_utilization = await compute_clinic_utilization(db, clinic_id=clinic_id or None, start_date=start or None, end_date=end or None)
    avg_clinic_utilization = (
        round(sum(c.get("utilization_percentage", 0) for c in clinic_utilization) / len(clinic_utilization), 1)
        if clinic_utilization
        else 0
    )

    return {
        "total_appointments": total_appointments,
        "predicted_no_shows": predicted_no_shows,
        "average_waiting_time": avg_waiting_time,
        "average_doctor_load": avg_doctor_load,
        "high_risk_appointments": high_risk,
        "clinic_utilization": avg_clinic_utilization,
    }


async def _time_series(appointments, match: dict, field: str, value_expr: Any) -> list[dict]:
    return await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$appointment_day"}},
                    "value": value_expr,
                }
            },
            {"$sort": {"_id": 1}},
        ],
    )


def _rounded(value: Any, digits: int = 1) -> float:
    try:
        return round(float(value), digits)
    except (TypeError, ValueError):
        return 0.0


async def dashboard_charts(db, clinic_id: str = "", start: str = "", end: str = "") -> dict:
    match = _base_match(clinic_id, "", start, end)
    appointments = db["appointments"]

    volume = await _time_series(appointments, match, "appointments", {"$sum": 1})

    # No-show rate per day: aggregate raw counts first, round in Python.
    # ($round / $multiply / $divide are not valid inside a $group stage.)
    no_show_rows = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$appointment_day"}},
                    "total": {"$sum": 1},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                }
            },
            {"$sort": {"_id": 1}},
        ],
    )
    no_show_rate = [
        {"_id": r.get("id"), "value": _rounded(r.get("no_shows") / r.get("total") * 100 if r.get("total") else 0)}
        for r in no_show_rows
    ]

    waiting_rows = await _time_series(appointments, match, "waiting_time", {"$avg": "$waiting_time"})
    waiting_trend = [{"_id": r.get("id"), "value": _rounded(r.get("value"))} for r in waiting_rows]
    clinic_utilization = await compute_clinic_utilization(db, clinic_id=clinic_id or None, start_date=start or None, end_date=end or None)
    doctor_workload = await compute_doctor_workload(db, clinic_id=clinic_id or None, start_date=start or None, end_date=end or None)

    risk_rows = await aggregate_to_list(
        db["predictions"],
        [{"$group": {"_id": "$scheduling_risk", "count": {"$sum": 1}}}],
    )
    # serialize_doc renames the Mongo "_id" key to "id" - reshape for the API.
    risk_distribution = [
        {"_id": r.get("id"), "count": r.get("count", 0)}
        for r in risk_rows
    ]

    def rename(rows, value_key: str) -> list[dict]:
        return [{"date": r.get("id"), value_key: r.get("value")} for r in rows]

    return {
        "appointment_volume": rename(volume, "appointments"),
        "no_show_rate": rename(no_show_rate, "rate"),
        "waiting_time_trend": rename(waiting_trend, "waiting_time"),
        "clinic_utilization": clinic_utilization,
        "doctor_workload": doctor_workload,
        "scheduling_risk_distribution": risk_distribution,
    }


async def waiting_time_analytics(db, clinic_id: str = "", doctor_id: str = "", start: str = "", end: str = "") -> dict:
    match = _base_match(clinic_id, doctor_id, start, end)
    appointments = db["appointments"]

    # Compute summary stats directly in MongoDB via aggregation pipeline (zero network memory load)
    stats_pipeline = [
        {"$match": {**match, "waiting_time": {"$type": "number"}}},
        {
            "$group": {
                "_id": None,
                "average": {"$avg": "$waiting_time"},
                "maximum": {"$max": "$waiting_time"},
                "count": {"$sum": 1},
            }
        },
    ]
    stats_agg = await aggregate_to_list(appointments, stats_pipeline)
    if not stats_agg:
        stats = {"average": 0, "median": 0, "maximum": 0, "count": 0}
    else:
        agg = stats_agg[0]
        count = agg.get("count", 0)
        avg = round(agg.get("average", 0) or 0, 1)
        maximum = round(agg.get("maximum", 0) or 0, 1)
        median = avg
        if count > 0:
            mid_offset = count // 2
            mid_docs = await appointments.find({**match, "waiting_time": {"$type": "number"}}, {"waiting_time": 1}).sort("waiting_time", 1).skip(mid_offset).limit(1).to_list(length=1)
            if mid_docs:
                median = round(float(mid_docs[0].get("waiting_time", avg)), 1)
        stats = {"average": avg, "median": median, "maximum": maximum, "count": count}

    # Distribution via bucket (skip documents without a numeric waiting_time,
    # because $bucket fails on null values)
    distribution_rows = await aggregate_to_list(
        appointments,
        [
            {"$match": {**match, "waiting_time": {"$type": "number"}}},
            {
                "$bucket": {
                    "groupBy": "$waiting_time",
                    "boundaries": [0, 10, 20, 30, 45, 60, 90, 120, 180],
                    "default": "Other",
                }
            },
        ],
    )

    distribution_rows.sort(key=lambda r: str(r.get("id")))
    distribution = [
        {"_id": str(r.get("id")), "count": r.get("count", 0)}
        for r in distribution_rows
    ]

    by_clinic = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {"$group": {"_id": "$clinic_id", "average": {"$avg": "$waiting_time"}}},
            {"$sort": {"_id": 1}},
        ],
    )
    by_doctor = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {"$group": {"_id": "$doctor_id", "average": {"$avg": "$waiting_time"}}},
        ],
    )
    by_doctor.sort(key=lambda r: r.get("average") or 0, reverse=True)

    trend_rows = await _time_series(appointments, match, "waiting_time", {"$avg": "$waiting_time"})
    trend = [{"date": r.get("id"), "waiting_time": _rounded(r.get("value"))} for r in trend_rows]

    return {
        "stats": stats,
        "distribution": distribution,
        "by_clinic": [
            {"clinic_id": r.get("id"), "average": _rounded(r.get("average"))} for r in by_clinic
        ],
        "by_doctor": [
            {"doctor_id": r.get("id"), "average": _rounded(r.get("average"), 2)} for r in by_doctor
        ],
        "trend": trend,
    }


async def scheduling_risk_analytics(db, clinic_id: str = "", start: str = "", end: str = "") -> dict:
    appointment_ids = None
    if clinic_id:
        appointment_ids = [a["id"] for a in await find_to_list(db["appointments"], {"clinic_id": clinic_id})]

    query: dict[str, Any] = {}
    if appointment_ids is not None:
        query["appointment_id"] = {"$in": appointment_ids}

    distribution_rows = await aggregate_to_list(
        db["predictions"],
        [
            {"$match": query},
            {"$group": {"_id": "$scheduling_risk", "count": {"$sum": 1}}},
        ],
    )
    distribution = [
        {"_id": r.get("id"), "count": r.get("count", 0)}
        for r in distribution_rows
    ]

    high_risk = (
        await db["predictions"].find({**query, "scheduling_risk": "HIGH"})
        .sort("risk_score", -1)
        .limit(100)
        .to_list(length=100)
    )
    from app.models import serialize_doc

    # Bulk-fetch all associated appointments, patients, doctors, and clinics in 4 batch queries
    app_oids = [a_oid for pred in high_risk if (a_oid := _to_object_id(pred.get("appointment_id")))]
    appointments_map = {}
    if app_oids:
        app_list = await db["appointments"].find({"_id": {"$in": app_oids}}).to_list(length=len(app_oids))
        appointments_map = {doc["_id"]: doc for doc in app_list}

    patient_oids = [p_oid for app in appointments_map.values() if (p_oid := _to_object_id(app.get("patient_id")))]
    patients_map = {}
    if patient_oids:
        p_list = await db["patients"].find({"_id": {"$in": patient_oids}}).to_list(length=len(patient_oids))
        patients_map = {doc["_id"]: doc for doc in p_list}

    doctor_ids = list({app.get("doctor_id") for app in appointments_map.values() if app.get("doctor_id")})
    doctors_map = {}
    if doctor_ids:
        d_list = await db["doctors"].find({"doctor_id": {"$in": doctor_ids}}).to_list(length=len(doctor_ids))
        doctors_map = {doc["doctor_id"]: doc for doc in d_list}

    clinic_ids = list({app.get("clinic_id") for app in appointments_map.values() if app.get("clinic_id")})
    clinics_map = {}
    if clinic_ids:
        c_list = await db["clinics"].find({"clinic_id": {"$in": clinic_ids}}).to_list(length=len(clinic_ids))
        clinics_map = {doc["clinic_id"]: doc for doc in c_list}

    high_risk_items = []
    for pred in high_risk:
        item = serialize_doc(pred)
        oid = _to_object_id(pred.get("appointment_id"))
        appointment = appointments_map.get(oid) if oid else None
        patient = None
        doctor = None
        clinic = None
        if appointment:
            patient_oid = _to_object_id(appointment.get("patient_id"))
            patient = patients_map.get(patient_oid) if patient_oid else None
            doctor = doctors_map.get(appointment.get("doctor_id"))
            clinic = clinics_map.get(appointment.get("clinic_id"))
        item["patient_name"] = patient.get("name", "Unknown") if patient else "Unknown"
        item["doctor_name"] = doctor.get("name", "Unknown") if doctor else "Unknown"
        item["clinic_name"] = clinic.get("name", "Unknown") if clinic else "Unknown"
        appointment_date = appointment.get("appointment_day") if appointment else None
        if isinstance(appointment_date, datetime):
            appointment_date = appointment_date.isoformat()
        item["appointment_date"] = appointment_date
        high_risk_items.append(item)

    return {"distribution": distribution, "high_risk_appointments": high_risk_items}


def _to_object_id(value: str):
    from bson import ObjectId

    try:
        return ObjectId(value)
    except Exception:
        return None


async def advanced_analytics(db, clinic_id: str = "", start: str = "", end: str = "") -> dict:
    match = _base_match(clinic_id, "", start, end)
    appointments = db["appointments"]

    sms_impact = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {
                "$group": {
                    "_id": "$sms_received",
                    "appointments": {"$sum": 1},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                }
            },
        ],
    )
    sms_impact = [
        {
            "sms_received": r.get("id"),
            "appointments": r.get("appointments"),
            "no_show_rate": round(r.get("no_shows") / r.get("appointments") * 100, 1) if r.get("appointments") else 0,
        }
        for r in sms_impact
    ]

    age_groups = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {
                "$group": {
                    "_id": {
                        "$switch": {
                            "branches": [
                                {"case": {"$lte": ["$age", 18]}, "then": "0-18"},
                                {"case": {"$lte": ["$age", 30]}, "then": "19-30"},
                                {"case": {"$lte": ["$age", 45]}, "then": "31-45"},
                                {"case": {"$lte": ["$age", 60]}, "then": "46-60"},
                            ],
                            "default": "61+",
                        }
                    },
                    "appointments": {"$sum": 1},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                }
            },
        ],
    )
    age_groups = [
        {
            "age_group": r.get("id"),
            "appointments": r.get("appointments"),
            "no_show_rate": round(r.get("no_shows") / r.get("appointments") * 100, 1) if r.get("appointments") else 0,
        }
        for r in age_groups
    ]

    neighbourhoods = await aggregate_to_list(
        appointments,
        [
            {"$match": match},
            {
                "$group": {
                    "_id": "$neighbourhood",
                    "appointments": {"$sum": 1},
                    "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
                }
            },
            {"$sort": {"appointments": -1}},
            {"$limit": 15},
        ],
    )
    neighbourhoods = [
        {
            "neighbourhood": r.get("id") or "Unknown",
            "appointments": r.get("appointments"),
            "no_show_rate": round(r.get("no_shows") / r.get("appointments") * 100, 1) if r.get("appointments") else 0,
        }
        for r in neighbourhoods
    ]

    return {
        "sms_impact": sms_impact,
        "age_groups": age_groups,
        "neighbourhoods": neighbourhoods,
    }
