from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class PreviousTraining(BaseModel):
    """A prior training/course an official has already completed, used as input to competency scoring."""
    title: str = Field(..., example="Foundations of National Sample Survey (NSSTA)")
    year: Optional[int] = Field(None, example=2024)
    provider: Optional[str] = Field(None, example="NSSTA")

class UserProfileBase(BaseModel):
    name: str = Field(..., example="Meet Patidar")
    email: Optional[str] = Field(None, example="meet.patidar@mospi.gov.in")

    # --- Official Statistics System profile fields (PS-101 requirement) ---
    designation: Optional[str] = Field(None, example="Junior Statistical Officer")
    department: Optional[str] = Field(None, example="National Sample Survey Office (NSSO)")
    job_role: Optional[str] = Field(None, example="MoSPI Statistical Data Analyst")
    work_experience_years: Optional[float] = Field(None, ge=0, example=3.5)
    previous_trainings: List[PreviousTraining] = Field(default_factory=list)

    # --- Legacy / general-track fields (kept for backward compatibility with
    #     the existing degree-based demo flow; not required for official profiles) ---
    degree: Optional[str] = Field(None, example="B.Tech in Computer Science & Engineering")
    target_role: Optional[str] = Field(None, example="MoSPI Statistical Data Analyst")
    current_skills: List[str] = Field(default_factory=list, example=["Python", "SQL", "Git"])
    completed_modules: int = Field(default=0, ge=0, example=14)

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    work_experience_years: Optional[float] = None
    previous_trainings: Optional[List[PreviousTraining]] = None
    degree: Optional[str] = None
    target_role: Optional[str] = None
    current_skills: Optional[List[str]] = None
    completed_modules: Optional[int] = None

class UserProfileResponse(UserProfileBase):
    id: str = Field(..., alias="_id", example="66c9f28a9b9a1e001f3c8e4a")
    role: str = Field(default="learner", example="learner", description="RBAC role: 'learner' or 'admin'")
    readiness_score: float = Field(default=0.0, ge=0.0, le=100.0, example=78.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
