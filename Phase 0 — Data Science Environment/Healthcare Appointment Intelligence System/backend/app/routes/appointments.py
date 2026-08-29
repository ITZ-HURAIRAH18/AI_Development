from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import (
    get_current_user,
    require_admin_or_staff,
    require_authenticated,
)
from app.db.mongodb import get_database
from app.models.appointment import Appointment
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate,
)
from app.services.appointment_service import (
    appointment_response_from_doc,
    get_appointment_detail,
    list_appointments,
)
from app.services.prediction_service import compute_and_store_prediction
from app.utils.responses import success

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


async def _resolve_patient(db, patient_ref: str) -> Optional[dict]:
    """Resolve a patient by internal ObjectId (preferred) or patient_id code."""
    from bson import ObjectId

    doc = None
    try:
        doc = await db["patients"].find_one({"_id": ObjectId(patient_ref)})
    except Exception:
        doc = None
    if doc is None:
        doc = await db["patients"].find_one({"patient_id": patient_ref})
    return doc


@router.get(
    "",
    summary="List appointments",
    description="Paginated, filterable list of appointments with prediction data.",
)
async def list_appointments_endpoint(
    search: str = Query("", description="Search by appointment id or patient id"),
    clinic_id: str = Query("", description="Filter by clinic id (C01..C05)"),
    doctor_id: str = Query("", description="Filter by doctor id"),
    risk: str = Query("", pattern="^(LOW|MEDIUM|HIGH)$", description="Filter by scheduling risk"),
    status: str = Query("", description="Filter by appointment status"),
    start_date: str = Query("", description="ISO date range start (YYYY-MM-DD)"),
    end_date: str = Query("", description="ISO date range end (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("appointment_day"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db=Depends(get_database),
    current_user=Depends(require_authenticated),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    result = await list_appointments(
        db,
        search=search,
        clinic_id=clinic_id,
        doctor_id=doctor_id,
        risk=risk,
        status=status,
        start_date=start_date,
        end_date=end_date,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return success(result)


@router.get(
    "/{appointment_id}",
    summary="Appointment detail",
    description="Full appointment detail including patient, doctor, clinic and prediction.",
)
async def get_appointment_endpoint(
    appointment_id: str,
    db=Depends(get_database),
    current_user=Depends(require_authenticated),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    detail = await get_appointment_detail(db, appointment_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return success(detail)


@router.post(
    "",
    summary="Create appointment",
    description="Creates a new appointment.",
)
async def create_appointment_endpoint(
    payload: AppointmentCreate,
    db=Depends(get_database),
    current_user=Depends(require_admin_or_staff),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    existing = await db["appointments"].find_one({"appointment_id": payload.appointment_id})
    if existing:
        raise HTTPException(status_code=409, detail="An appointment with this ID already exists")

    patient_doc = await _resolve_patient(db, payload.patient_id)
    if not patient_doc:
        raise HTTPException(status_code=422, detail="Patient not found")

    appointment_data = payload.model_dump()
    appointment_data["patient_id"] = str(patient_doc["_id"])
    appointment = Appointment(**appointment_data)
    result = await db["appointments"].insert_one(appointment.model_dump(exclude={"id"}))
    inserted_id = result.inserted_id
    doc = await db["appointments"].find_one({"_id": inserted_id})
    if doc:
        try:
            await compute_and_store_prediction(db, doc)
        except Exception:
            pass
    detail = await get_appointment_detail(db, str(inserted_id))
    return success(detail or {"id": str(inserted_id), **payload.model_dump()})


@router.put(
    "/{appointment_id}/status",
    summary="Update appointment status",
    description="Updates the status of an appointment (Scheduled, Completed, No-show, Cancelled).",
)
async def update_status_endpoint(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    db=Depends(get_database),
    current_user=Depends(require_authenticated),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    from bson import ObjectId

    try:
        oid = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Appointment not found")

    result = await db["appointments"].update_one({"_id": oid}, {"$set": {"status": payload.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    doc = await db["appointments"].find_one({"_id": oid})
    from app.models import serialize_doc

    response = AppointmentResponse(**appointment_response_from_doc(serialize_doc(doc)))
    return success(response.model_dump(mode="json"))


@router.post(
    "/{appointment_id}/predict",
    summary="Predict for an appointment",
    description="Runs the full prediction for an existing appointment and stores the result.",
)
async def predict_for_appointment_endpoint(
    appointment_id: str,
    db=Depends(get_database),
    current_user=Depends(require_authenticated),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    from bson import ObjectId

    try:
        oid = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Appointment not found")

    doc = await db["appointments"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")

    result = await compute_and_store_prediction(db, doc)
    return success(result)
