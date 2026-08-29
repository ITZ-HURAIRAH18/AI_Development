from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.core.security import get_current_user, hash_password
from app.db.mongodb import get_database
from app.models.user import User
from app.services.auth_service import create_user, get_user_by_email, to_user_response
from app.utils.responses import success
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/users", tags=["User Management"])


class UserCreateRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "staff"


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


@router.get("", summary="Get all users (admin only)")
async def list_users(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access user management")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    
    users = await db["users"].find({}).to_list(None)
    users_response = []
    for user in users:
        users_response.append({
            "id": str(user.get("_id")),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "created_at": user.get("created_at"),
        })
    
    return success(users_response)


@router.post("", summary="Create a new user (admin only)")
async def create_user_endpoint(
    payload: UserCreateRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="User with this email already exists")
    
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    await create_user(db, user)
    
    return success(to_user_response(user).model_dump(mode="json"), status_code=201)


@router.get("/{user_id}", summary="Get user by ID (admin only)")
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view other users")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return success({
            "id": str(user.get("_id")),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "created_at": user.get("created_at"),
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}", summary="Update user (admin only)")
async def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update users")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    
    try:
        update_data = {}
        if payload.name:
            update_data["name"] = payload.name
        if payload.email:
            # Check if email is already taken
            existing = await db["users"].find_one({
                "email": payload.email.lower(),
                "_id": {"$ne": ObjectId(user_id)}
            })
            if existing:
                raise HTTPException(status_code=409, detail="Email already in use")
            update_data["email"] = payload.email.lower()
        if payload.role:
            update_data["role"] = payload.role
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        return success({
            "id": str(user.get("_id")),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "created_at": user.get("created_at"),
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", summary="Delete user (admin only)")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available")
    
    try:
        # Prevent admin from deleting themselves
        if str(current_user.get("id")) == user_id:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
        result = await db["users"].delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return success({"message": "User deleted successfully"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
