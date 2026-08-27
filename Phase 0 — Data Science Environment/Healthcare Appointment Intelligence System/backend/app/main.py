import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.db.mongodb import close_database_connection, connect_to_database
from app.routes import analytics, appointments, auth, clinics, doctors, patients, predictions
from app.services.ml_service import ml_service

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("healthcare-intelligence")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models once at startup
    try:
        ml_service.load_models()
    except Exception as exc:
        logger.exception("Failed to load ML models: %s", exc)

    await connect_to_database()
    yield
    await close_database_connection()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.api_version,
        description=(
            "Healthcare Appointment Intelligence System — appointment risk prediction, "
            "waiting-time estimation, scheduling risk and clinic utilization analytics."
        ),
        lifespan=lifespan,
    )

    # CORS
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    if settings.frontend_url:
        origins.append(settings.frontend_url)
    # Allow Vercel frontend domain (handles preview deployments too)
    import os
    vercel_url = os.environ.get("VERCEL_FRONTEND_URL", "")
    if vercel_url and vercel_url not in origins:
        origins.append(vercel_url)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(auth.router)
    app.include_router(patients.router)
    app.include_router(appointments.router)
    app.include_router(doctors.router)
    app.include_router(clinics.router)
    app.include_router(predictions.router)
    app.include_router(analytics.router)

    # Health check
    @app.get("/api/health", tags=["System"])
    async def health_check():
        db = await connect_to_database()
        return JSONResponse(
            content={
                "success": True,
                "data": {
                    "status": "ok",
                    "models_loaded": ml_service.get_no_show_model() is not None,
                    "database_connected": db is not None,
                },
            }
        )

    # ------------------------------------------------------------------
    # Global exception handling (no stack traces leaked to clients)
    # ------------------------------------------------------------------

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": str(exc.detail)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        first = errors[0] if errors else {}
        field = ".".join(str(part) for part in first.get("loc", []) if part != "body")
        message = f"Invalid value for '{field}': {first.get('msg', 'validation error')}"
        return JSONResponse(
            status_code=422,
            content={"success": False, "message": message, "errors": errors},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "An unexpected error occurred. Please try again later."},
        )

    return app


app = create_app()
