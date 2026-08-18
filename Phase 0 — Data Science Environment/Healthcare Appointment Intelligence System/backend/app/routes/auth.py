from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.security import (
    create_access_token,
    get_current_user,
    get_bearer_token,
    hash_password,
    verify_password,
)
from app.db.mongodb import get_database
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    to_user_response,
    user_response_from_doc,
)
from app.utils.responses import success

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    summary="Register a new user",
    description="Creates a user account and returns a JWT access token.",
)
async def register(payload: RegisterRequest, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    await create_user(db, user)

    token = create_access_token(user.id or "", user.role)
    return success(TokenResponse(access_token=token, user=to_user_response(user)).model_dump(mode="json"))


@router.post(
    "/login",
    summary="Log in",
    description="Authenticates with email and password, returns a JWT access token.",
)
async def login(payload: LoginRequest, db=Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")

    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(str(user["_id"]), user.get("role", "staff"))
    response = TokenResponse(access_token=token, user=UserResponse(**user_response_from_doc(user)))
    return success(response.model_dump(mode="json"))


@router.get(
    "/me",
    summary="Current user",
    description="Returns the currently authenticated user.",
)
async def me(current_user=Depends(get_current_user)):
    return success(UserResponse(**user_response_from_doc(current_user)).model_dump(mode="json"))


@router.post(
    "/logout",
    summary="Log out",
    description="Invalidates the client session. JWT is stateless, so the client discards the token.",
)
async def logout(request: Request):
    get_bearer_token(request)
    return success({"message": "Logged out"})
