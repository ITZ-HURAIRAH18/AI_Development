from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.db.mongodb import get_database
from app.schemas.auth import TokenData

settings = get_settings()


# ------------------------------------------------------------------
# Password hashing
# ------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


# ------------------------------------------------------------------
# JWT
# ------------------------------------------------------------------

def create_access_token(subject: str, role: str, expires_minutes: int | None = None) -> str:
    now = datetime.now(timezone.utc)
    expire_minutes = expires_minutes or settings.access_token_expire_minutes
    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise JWTError("Missing subject")
        return TokenData(subject=subject, role=payload.get("role", "staff"))
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        ) from exc


# ------------------------------------------------------------------
# Bearer token extraction
# ------------------------------------------------------------------

def get_bearer_token(request: Request) -> str:
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return authorization.split(" ", 1)[1].strip()


# ------------------------------------------------------------------
# Current user dependency
# ------------------------------------------------------------------

async def get_current_user(
    request: Request,
    db=Depends(get_database),
):
    from app.services.auth_service import get_user_by_id

    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not available",
        )
    token = get_bearer_token(request)
    token_data = decode_access_token(token)
    user = await get_user_by_id(db, token_data.subject)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return user
