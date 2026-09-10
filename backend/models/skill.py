from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from backend.models.course import CourseModel

# The 4 competency domains mandated by PS-101
COMPETENCY_DOMAINS = [
    "Statistical Competencies",
    "Technical Competencies",
    "Digital Governance",
    "Behavioural & Managerial Competencies",
]

class SkillAnalysisRequest(BaseModel):
    user_id: Optional[str] = Field(None, example="66c9f28a9b9a1e001f3c8e4a")
    target_role: Optional[str] = Field(None, example="MoSPI Statistical Data Analyst")
    current_skills: Optional[List[str]] = Field(None, example=["Python", "SQL", "Git"])
    degree: Optional[str] = Field(None, example="B.Tech in Computer Science & Engineering")

    # Optional official-profile context; when provided, the assessment is scored
    # against the official competency framework instead of the generic-track one.
    designation: Optional[str] = Field(None, example="Junior Statistical Officer")
    department: Optional[str] = Field(None, example="NSSO")
    work_experience_years: Optional[float] = Field(None, example=3.5)

class RoleBenchmark(BaseModel):
    id: str
    title: str
    category: str
    demand_score: str
    required_skills: List[str]
    # skill -> domain mapping for this role, e.g. {"Survey Design": "Statistical Competencies"}
    skill_domains: Dict[str, str] = Field(default_factory=dict)

class DomainGap(BaseModel):
    domain: str
    acquired: List[str] = Field(default_factory=list)
    missing: List[str] = Field(default_factory=list)
    readiness_score: float = 0.0

class SkillAnalysisResponse(BaseModel):
    target_role: str
    degree: Optional[str]
    readiness_score: float = Field(..., description="Percentage of required skills fulfilled (0-100%)")
    acquired_skills: List[str] = Field(..., description="Skills already mastered matching the role")
    missing_skills: List[str] = Field(..., description="Competency Gap - skills required but missing")
    supplementary_skills: List[str] = Field(default_factory=list, description="Extra skills possessed outside target role")
    recommended_courses: List[CourseModel] = Field(..., description="iGOT Karmayogi / NSSTA TPAC courses to bridge the gaps")
    roadmap_steps: List[Dict[str, str]] = Field(default_factory=list, description="Suggested vertical stepper learning milestones")
    domain_breakdown: List[DomainGap] = Field(default_factory=list, description="Gap analysis grouped by the 4 PS-101 competency domains")
