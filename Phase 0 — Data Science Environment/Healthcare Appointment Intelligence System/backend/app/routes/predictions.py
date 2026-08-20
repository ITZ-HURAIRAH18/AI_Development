from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user
from app.db.mongodb import get_database
from app.schemas.prediction import (
    FullPredictionRequest,
    FullPredictionResponse,
    NoShowRequest,
    NoShowResponse,
    WaitingTimeRequest,
    WaitingTimeResponse,
)
from app.services.no_show_service import predict_no_show
from app.services.prediction_service import run_full_prediction, store_prediction
from app.services.waiting_time_service import predict_waiting_time
from app.utils.responses import success

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.post(
    "/no-show",
    summary="No-show prediction",
    description="Predicts the probability that a patient will not attend their appointment.",
)
async def no_show(
    payload: NoShowRequest,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    probability, risk = predict_no_show(payload)
    return success(NoShowResponse(probability=probability, risk=risk).model_dump())


@router.post(
    "/waiting-time",
    summary="Waiting-time prediction",
    description="Predicts the expected waiting time in minutes for an appointment.",
)
async def waiting_time(
    payload: WaitingTimeRequest,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    value = predict_waiting_time(payload)
    return success(WaitingTimeResponse(expected_waiting_time=value).model_dump())


@router.post(
    "/full",
    summary="Combined prediction",
    description=(
        "Runs the no-show model, waiting-time model, and scheduling risk logic together. "
        "When an appointment_id is provided the result is stored in MongoDB."
    ),
)
async def full_prediction(
    payload: FullPredictionRequest,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    try:
        result = run_full_prediction(payload.no_show, payload.operational)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if payload.appointment_id:
        await store_prediction(db, payload.appointment_id, result)

    return success(result.model_dump())


@router.get(
    "",
    summary="Prediction history",
    description="Lists stored predictions, optionally filtered by appointment.",
)
async def prediction_history(
    appointment_id: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    query = {"appointment_id": appointment_id} if appointment_id else {}
    total = await db["predictions"].count_documents(query)
    docs = (
        await db["predictions"].find(query)
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
        .to_list(length=limit)
    )

    from app.models import serialize_doc

    items = []
    for doc in docs:
        item = serialize_doc(doc)
        item.pop("_id", None)
        items.append(item)

    return success({"items": items, "total": total, "page": page, "limit": limit})
