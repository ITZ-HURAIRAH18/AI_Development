import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models import serialize_doc
from app.models.user import User
from app.schemas.auth import UserResponse

logger = logging.getLogger("healthcare-intelligence")


def user_response_from_doc(doc: dict) -> dict:
    serialized = serialize_doc(doc)
    serialized.pop("password_hash", None)
    return serialized


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict | None:
    return await db["users"].find_one({"email": email.lower()})


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict | None:
    from bson import ObjectId

    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return await db["users"].find_one({"_id": oid})


async def create_user(db: AsyncIOMotorDatabase, user: User) -> User:
    doc = user.model_dump(exclude={"id"})
    result = await db["users"].insert_one(doc)
    user.id = str(result.inserted_id)
    return user


def to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id or "",
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
    )
