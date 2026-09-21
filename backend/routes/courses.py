from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, Depends
from backend.models.course import CourseResponse
from backend.services.igot_service import igot_service
from backend.dependencies import get_current_user, require_admin
from backend.database import db_manager

router = APIRouter(prefix="/courses", tags=["iGOT Karmayogi Courses"])

@router.get("", response_model=CourseResponse)
async def list_igot_courses(
    skill: Optional[str] = Query(None, description="Filter courses by targeted skill name"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Returns the accredited mock iGOT Karmayogi course catalog, optionally filtered by skill."""
    if skill:
        courses = await igot_service.find_courses_for_skills([skill])
    else:
        courses = await igot_service.get_all_courses()
    return CourseResponse(total=len(courses), courses=courses)

@router.post("/seed")
async def seed_courses(current_user: Dict[str, Any] = Depends(require_admin)):
    """Manually triggers seeding of default iGOT courses into the database."""
    count = await igot_service.seed_courses()
    return {"message": f"Successfully ensured {count} iGOT Karmayogi courses in database."}

@router.post("/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Enrolls the authenticated user in an iGOT course."""
    collection = db_manager.get_collection("users")
    await collection.update_one(
        {"_id": current_user["_id"]},
        {"$addToSet": {"enrolled_courses": course_id}}
    )
    return {"message": f"Successfully enrolled in course {course_id}"}

