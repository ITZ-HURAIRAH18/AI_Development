import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

logger = logging.getLogger("healthcare-intelligence")

settings = get_settings()

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_to_database() -> AsyncIOMotorDatabase | None:
    """Connect to MongoDB (Atlas). Returns None when not configured."""
    global _client, _database

    if _database is not None:
        return _database

    if not settings.mongodb_url:
        logger.warning(
            "MONGODB_URL is not set. Database-dependent endpoints will be unavailable. "
            "Copy backend/.env.example to backend/.env and provide your Atlas connection string."
        )
        return None

    _client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
    _database = _client[settings.database_name]

    try:
        await _client.admin.command("ping")
        logger.info("Connected to MongoDB database '%s'", settings.database_name)
        # Create performance indexes asynchronously in background
        await _create_database_indexes(_database)
    except Exception:
        logger.exception("MongoDB connection failed")
        _database = None

    return _database


async def _create_database_indexes(db: AsyncIOMotorDatabase) -> None:
    try:
        await db["predictions"].create_index([("scheduling_risk", 1), ("risk_score", -1)])
        await db["predictions"].create_index([("appointment_id", 1)], unique=True)
        await db["appointments"].create_index([("clinic_id", 1)])
        await db["appointments"].create_index([("doctor_id", 1)])
        await db["appointments"].create_index([("patient_id", 1)])
        await db["appointments"].create_index([("appointment_day", 1)])
        await db["doctors"].create_index([("doctor_id", 1)], unique=True)
        await db["clinics"].create_index([("clinic_id", 1)], unique=True)
        await db["patients"].create_index([("patient_id", 1)], unique=True)
    except Exception as exc:
        logger.warning("Could not create database indexes: %s", exc)



async def close_database_connection() -> None:
    global _client, _database
    if _client is not None:
        _client.close()
    _client = None
    _database = None


async def get_database() -> AsyncIOMotorDatabase | None:
    if _database is None:
        await connect_to_database()
    return _database
