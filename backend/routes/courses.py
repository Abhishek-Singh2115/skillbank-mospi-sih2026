from typing import Optional
from fastapi import APIRouter, Query
from backend.models.course import CourseResponse
from backend.services.igot_service import igot_service

router = APIRouter(prefix="/courses", tags=["iGOT Karmayogi Courses"])

@router.get("", response_model=CourseResponse)
async def list_igot_courses(skill: Optional[str] = Query(None, description="Filter courses by targeted skill name")):
    """Returns the accredited mock iGOT Karmayogi course catalog, optionally filtered by skill."""
    if skill:
        courses = await igot_service.find_courses_for_skills([skill])
    else:
        courses = await igot_service.get_all_courses()
    return CourseResponse(total=len(courses), courses=courses)

@router.post("/seed")
async def seed_courses():
    """Manually triggers seeding of default iGOT courses into the database."""
    count = await igot_service.seed_courses()
    return {"message": f"Successfully ensured {count} iGOT Karmayogi courses in database."}
