from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, require_admin
from app.db.mongodb import get_database
from app.models.clinic import Clinic
from app.services.clinic_service import get_clinic_detail, list_clinics
from app.utils.responses import success

router = APIRouter(prefix="/api/clinics", tags=["Clinics"])


@router.get(
    "",
    summary="List clinics",
    description="Lists clinics with utilization and operational statistics.",
)
async def list_clinics_endpoint(
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await list_clinics(db))


@router.get(
    "/{clinic_id}",
    summary="Clinic detail",
    description="Clinic overview including doctors, utilization and risk distribution.",
)
async def get_clinic_endpoint(
    clinic_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    detail = await get_clinic_detail(db, clinic_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return success(detail)


@router.post(
    "",
    summary="Create clinic",
    description="Creates a new clinic record.",
)
async def create_clinic_endpoint(
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(require_admin),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    try:
        clinic = Clinic(
            clinic_id=payload["clinic_id"],
            name=payload["name"],
            location=payload.get("location", ""),
            doctor_ids=payload.get("doctor_ids", []),
        )
    except KeyError as exc:
        raise HTTPException(status_code=422, detail=f"Missing field: {exc}")

    existing = await db["clinics"].find_one({"clinic_id": clinic.clinic_id})
    if existing:
        raise HTTPException(status_code=409, detail="A clinic with this ID already exists")

    result = await db["clinics"].insert_one(clinic.model_dump(exclude={"id"}))
    return success({"id": str(result.inserted_id), **clinic.model_dump(exclude={"id"})})
