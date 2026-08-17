from fastapi import APIRouter, Depends, HTTPException, Query

from app.db.mongodb import get_database
from app.schemas.prediction import (
    FullPredictionRequest,
    FullPredictionResponse,
    NoShowRequest,
    NoShowResponse,
    PredictionHistoryResponse,
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
    response_model=NoShowResponse,
    summary="No-show prediction",
    description="Predicts the probability that a patient will not attend their appointment.",
)
async def no_show(payload: NoShowRequest, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    probability, risk = predict_no_show(payload)
    return NoShowResponse(probability=probability, risk=risk)


@router.post(
    "/waiting-time",
    response_model=WaitingTimeResponse,
    summary="Waiting-time prediction",
    description="Predicts the expected waiting time in minutes for an appointment.",
)
async def waiting_time(payload: WaitingTimeRequest, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    value = predict_waiting_time(payload)
    return WaitingTimeResponse(expected_waiting_time=value)


@router.post(
    "/full",
    response_model=FullPredictionResponse,
    summary="Combined prediction",
    description=(
        "Runs the no-show model, waiting-time model, and scheduling risk logic together. "
        "When an appointment_id is provided the result is stored in MongoDB."
    ),
)
async def full_prediction(payload: FullPredictionRequest, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    try:
        result = run_full_prediction(payload.no_show, payload.operational)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if payload.appointment_id:
        await store_prediction(db, payload.appointment_id, result)

    return result


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
