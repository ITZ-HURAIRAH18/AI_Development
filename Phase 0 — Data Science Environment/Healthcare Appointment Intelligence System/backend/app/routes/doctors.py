from fastapi import APIRouter, Depends, HTTPException, Query

from app.db.mongodb import get_database
from app.models.doctor import Doctor
from app.services.doctor_service import get_doctor_detail, list_doctors
from app.utils.responses import success

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get(
    "",
    summary="List doctors",
    description="Lists doctors with workload statistics.",
)
async def list_doctors_endpoint(
    search: str = Query(""),
    clinic_id: str = Query("", description="Filter by clinic id"),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await list_doctors(db, search=search, clinic_id=clinic_id))


@router.get(
    "/{doctor_id}",
    summary="Doctor detail",
    description="Doctor information with workload stats and trends.",
)
async def get_doctor_endpoint(doctor_id: str, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    detail = await get_doctor_detail(db, doctor_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return success(detail)


@router.post(
    "",
    summary="Create doctor",
    description="Creates a new doctor record.",
)
async def create_doctor_endpoint(payload: dict, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    try:
        doctor = Doctor(
            doctor_id=payload["doctor_id"],
            name=payload["name"],
            clinic_id=payload["clinic_id"],
            specialization=payload.get("specialization", "General Practice"),
            active=payload.get("active", True),
        )
    except KeyError as exc:
        raise HTTPException(status_code=422, detail=f"Missing field: {exc}")

    existing = await db["doctors"].find_one({"doctor_id": doctor.doctor_id})
    if existing:
        raise HTTPException(status_code=409, detail="A doctor with this ID already exists")

    result = await db["doctors"].insert_one(doctor.model_dump(exclude={"id"}))
    return success({"id": str(result.inserted_id), **doctor.model_dump(exclude={"id"})})
