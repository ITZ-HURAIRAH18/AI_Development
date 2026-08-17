from fastapi import APIRouter, Depends, HTTPException, Query

from app.db.mongodb import get_database
from app.services.analytics_service import (
    advanced_analytics,
    dashboard_charts,
    dashboard_data,
    scheduling_risk_analytics,
    waiting_time_analytics,
)
from app.services.utilization_service import compute_clinic_utilization, compute_doctor_workload
from app.utils.responses import success

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get(
    "/dashboard",
    summary="Dashboard KPIs",
    description="Key performance indicators for the dashboard.",
)
async def dashboard(
    clinic_id: str = Query(""),
    start: str = Query("", description="ISO date range start (YYYY-MM-DD)"),
    end: str = Query("", description="ISO date range end (YYYY-MM-DD)"),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await dashboard_data(db, clinic_id=clinic_id, start=start, end=end))


@router.get(
    "/charts",
    summary="Dashboard charts",
    description="All chart datasets for the dashboard.",
)
async def charts(
    clinic_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await dashboard_charts(db, clinic_id=clinic_id, start=start, end=end))


@router.get(
    "/clinic-utilization",
    summary="Clinic utilization",
    description="Clinic-level utilization and operational statistics.",
)
async def clinic_utilization(
    clinic_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    rows = await compute_clinic_utilization(db, clinic_id=clinic_id or None, start_date=start or None, end_date=end or None)
    return success(rows)


@router.get(
    "/doctor-workload",
    summary="Doctor workload",
    description="Workload statistics per doctor.",
)
async def doctor_workload(
    clinic_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    rows = await compute_doctor_workload(db, clinic_id=clinic_id or None, start_date=start or None, end_date=end or None)
    return success(rows)


@router.get(
    "/waiting-time",
    summary="Waiting time analytics",
    description="Waiting time statistics, distribution and breakdowns.",
)
async def waiting_time(
    clinic_id: str = Query(""),
    doctor_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await waiting_time_analytics(db, clinic_id=clinic_id, doctor_id=doctor_id, start=start, end=end))


@router.get(
    "/scheduling-risk",
    summary="Scheduling risk analytics",
    description="Risk distribution and the highest-risk appointments.",
)
async def scheduling_risk(
    clinic_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await scheduling_risk_analytics(db, clinic_id=clinic_id, start=start, end=end))


@router.get(
    "/advanced",
    summary="Advanced analytics",
    description="SMS impact, age-group and neighbourhood analysis.",
)
async def advanced(
    clinic_id: str = Query(""),
    start: str = Query(""),
    end: str = Query(""),
    db=Depends(get_database),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    return success(await advanced_analytics(db, clinic_id=clinic_id, start=start, end=end))
