import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.user import UserProfileCreate, UserProfileResponse, UserProfileUpdate
from backend.database import db_manager
from backend.services.skill_service import skill_service
from backend.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

ALLOWED_UPDATE_FIELDS = {
    "name", "designation", "department", "job_role", 
    "work_experience_years", "previous_trainings", 
    "degree", "target_role", "current_skills"
}

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update the authenticated user's profile securely.
    """
    collection = db_manager.get_collection("users")
    user_id = current_user["_id"]

    # Filter out disallowed fields
    update_data = {
        k: v for k, v in profile_data.dict(exclude_unset=True).items() 
        if k in ALLOWED_UPDATE_FIELDS
    }
    
    if not update_data:
        return UserProfileResponse(**current_user)

    # Compute industry readiness score if relevant fields changed
    # Need to merge existing user data with the update data to run analysis
    merged_skills = update_data.get("current_skills", current_user.get("current_skills", []))
    merged_degree = update_data.get("degree", current_user.get("degree", ""))
    merged_designation = update_data.get("designation", current_user.get("designation", ""))
    merged_target_role = update_data.get("target_role", current_user.get("target_role", ""))

    effective_target_role = merged_target_role or (
        "MoSPI Statistical Officer" if merged_designation else "MoSPI Statistical Data Analyst"
    )

    readiness_score, _, _, _ = skill_service.analyze_skills(
        target_role_name=effective_target_role,
        current_skills=merged_skills,
        degree=merged_degree
    )

    update_data["readiness_score"] = readiness_score
    update_data["updated_at"] = datetime.utcnow()

    # Never overwrite sensitive fields
    for field in ["role", "_id", "id", "email", "google_id"]:
        update_data.pop(field, None)

    await collection.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    updated_doc = await collection.find_one({"_id": user_id})
    updated_doc["_id"] = str(updated_doc["_id"])
    return UserProfileResponse(**updated_doc)

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves the authenticated user's profile."""
    current_user["_id"] = str(current_user["_id"])
    return UserProfileResponse(**current_user)
