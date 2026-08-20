from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import (
    get_current_user,
    require_admin,
    require_admin_or_staff,
)
from app.db.mongodb import get_database
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.services.patient_service import (
    get_patient_detail,
    list_patients,
    patient_response_from_doc,
)
from app.utils.responses import success
from app.models.serializers import find_to_list

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get(
    "",
    summary="List patients",
    description="Paginated, searchable list of patients with risk status.",
)
async def list_patients_endpoint(
    search: str = Query("", description="Search by name or patient id"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await list_patients(db, search=search, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order))


@router.get(
    "/{patient_id}",
    summary="Patient detail",
    description="Patient information with appointment history, no-show rate and risk status.",
)
async def get_patient_endpoint(
    patient_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    detail = await get_patient_detail(db, patient_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Patient not found")
    return success(detail)


@router.post(
    "",
    summary="Create patient",
    description="Creates a new patient record.",
)
async def create_patient_endpoint(
    payload: PatientCreate,
    db=Depends(get_database),
    current_user=Depends(require_admin_or_staff),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    from app.models.patient import Patient

    patient = Patient(**payload.model_dump())
    result = await db["patients"].insert_one(patient.model_dump(exclude={"id"}))
    patient.id = str(result.inserted_id)
    return success(PatientResponse(**patient.model_dump()).model_dump(mode="json"))


@router.put(
    "/{patient_id}",
    summary="Update patient",
    description="Updates an existing patient record.",
)
async def update_patient_endpoint(
    patient_id: str,
    payload: PatientUpdate,
    db=Depends(get_database),
    current_user=Depends(require_admin_or_staff),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    from bson import ObjectId

    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Patient not found")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db["patients"].update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")

    doc = await db["patients"].find_one({"_id": oid})
    return success(PatientResponse(**patient_response_from_doc(doc)).model_dump(mode="json"))


@router.delete(
    "/{patient_id}",
    summary="Delete patient",
    description="Deletes a patient record.",
)
async def delete_patient_endpoint(
    patient_id: str,
    db=Depends(get_database),
    current_user=Depends(require_admin),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    from bson import ObjectId

    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await db["patients"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return success({"message": "Patient deleted"})
