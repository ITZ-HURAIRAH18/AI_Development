import logging
from typing import Any, List, Optional

from app.models.serializers import aggregate_to_list

logger = logging.getLogger("healthcare-intelligence")

# Reference: clinic_utilization.py
# utilization_percentage = average_doctor_load * 100 (capped at 100)


async def compute_clinic_utilization(
    db,
    clinic_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> List[dict[str, Any]]:
    """Compute utilization statistics per clinic from the appointments collection."""
    appointments = db["appointments"]

    match: dict = {}
    if clinic_id:
        match["clinic_id"] = clinic_id
    if start_date or end_date:
        match["appointment_day"] = {}
        if start_date:
            match["appointment_day"]["$gte"] = start_date
        if end_date:
            match["appointment_day"]["$lte"] = end_date

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$clinic_id",
                "doctors": {"$addToSet": "$doctor_id"},
                "patient_volume": {"$sum": 1},
                "total_consultation_minutes": {"$sum": "$consultation_duration"},
                "average_waiting_time": {"$avg": "$waiting_time"},
                "average_doctor_load": {"$avg": "$doctor_load"},
                "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
            }
        },
        {
            "$project": {
                "clinic_id": "$_id",
                "doctors_count": {"$size": "$doctors"},
                "patient_volume": 1,
                "total_consultation_minutes": 1,
                "average_waiting_time": {"$round": ["$average_waiting_time", 1]},
                "average_doctor_load": {"$round": ["$average_doctor_load", 2]},
                "no_show_count": "$no_shows",
                "no_show_rate": {
                    "$round": [
                        {"$multiply": [{"$divide": ["$no_shows", "$patient_volume"]}, 100]},
                        1,
                    ]
                },
                "utilization_percentage": {
                    "$min": [{"$multiply": [{"$avg": "$doctor_load"}, 100]}, 100]
                },
            }
        },
        {"$sort": {"utilization_percentage": -1}},
    ]

    try:
        rows = await aggregate_to_list(appointments, pipeline)
    except Exception:
        logger.exception("Clinic utilization aggregation failed")
        raise

    return rows


async def compute_doctor_workload(
    db,
    clinic_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> List[dict[str, Any]]:
    """Aggregate workload statistics per doctor."""
    appointments = db["appointments"]

    match: dict = {}
    if clinic_id:
        match["clinic_id"] = clinic_id
    if start_date or end_date:
        match["appointment_day"] = {}
        if start_date:
            match["appointment_day"]["$gte"] = start_date
        if end_date:
            match["appointment_day"]["$lte"] = end_date

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": "$doctor_id",
                "clinic_id": {"$first": "$clinic_id"},
                "appointments": {"$sum": 1},
                "average_waiting_time": {"$avg": "$waiting_time"},
                "average_doctor_load": {"$avg": "$doctor_load"},
                "no_shows": {"$sum": {"$cond": [{"$eq": ["$status", "No-show"]}, 1, 0]}},
            }
        },
        {
            "$project": {
                "doctor_id": "$_id",
                "clinic_id": 1,
                "appointments": 1,
                "average_waiting_time": {"$round": ["$average_waiting_time", 1]},
                "doctor_load": {"$round": ["$average_doctor_load", 2]},
                "no_show_rate": {
                    "$round": [
                        {"$multiply": [{"$divide": ["$no_shows", "$appointments"]}, 100]},
                        1,
                    ]
                },
                "utilization": {
                    "$min": [{"$multiply": [{"$avg": "$doctor_load"}, 100]}, 100]
                },
            }
        },
        {"$sort": {"appointments": -1}},
    ]

    try:
        rows = await aggregate_to_list(appointments, pipeline)
    except Exception:
        logger.exception("Doctor workload aggregation failed")
        raise

    return rows
