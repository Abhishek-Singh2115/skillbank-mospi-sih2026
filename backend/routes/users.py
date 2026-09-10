import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from backend.models.user import UserProfileCreate, UserProfileResponse, UserProfileUpdate
from backend.database import db_manager
from backend.services.skill_service import skill_service

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.post("/profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(profile_data: UserProfileCreate):
    """
    Create or update a user's profile with their current degree, target job role, and known skills.
    Automatically computes the user's initial industry readiness score.
    """
    collection = db_manager.get_collection("users")

    # Compute industry readiness score for the profile.
    # For official profiles (designation/department set), default to the
    # MoSPI Statistical Officer benchmark if no explicit target_role is given.
    effective_target_role = profile_data.target_role or (
        "MoSPI Statistical Officer" if profile_data.designation else "MoSPI Statistical Data Analyst"
    )
    readiness_score, _, _, _ = skill_service.analyze_skills(
        target_role_name=effective_target_role,
        current_skills=profile_data.current_skills,
        degree=profile_data.degree or ""
    )

    now = datetime.utcnow()
    user_dict = profile_data.dict()
    user_dict["readiness_score"] = readiness_score
    user_dict["updated_at"] = now

    # Check if a user with this email or name already exists
    existing = None
    if profile_data.email:
        existing = await collection.find_one({"email": profile_data.email})
    if not existing:
        existing = await collection.find_one({"name": profile_data.name})

    if existing:
        doc_id = str(existing["_id"])
        await collection.update_one(
            {"_id": doc_id},
            {"$set": user_dict}
        )
        updated_doc = await collection.find_one({"_id": doc_id})
        updated_doc["_id"] = str(updated_doc["_id"])
        return UserProfileResponse(**updated_doc)
    else:
        doc_id = str(uuid.uuid4())
        user_dict["_id"] = doc_id
        user_dict["created_at"] = now
        await collection.insert_one(user_dict)
        return UserProfileResponse(**user_dict)

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Retrieves a specific user profile by user ID."""
    collection = db_manager.get_collection("users")
    doc = await collection.find_one({"_id": user_id})
    if not doc:
        # Also try searching by name or email
        doc = await collection.find_one({"email": user_id})
        if not doc:
            doc = await collection.find_one({"name": user_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with identifier '{user_id}' not found."
        )
    doc["_id"] = str(doc["_id"])
    return UserProfileResponse(**doc)
