from typing import List, Optional
from pydantic import BaseModel, Field

class CourseModel(BaseModel):
    id: str = Field(..., example="IGOT-STAT-204")
    title: str = Field(..., example="National Sample Survey & MoSPI Data Frameworks")
    associated_skill: str = Field(..., example="Statistical Inference")
    description: str = Field(..., example="Official MoSPI curriculum on national sampling methodology and indicator frameworks.")
    link: str = Field(..., example="https://igotkarmayogi.gov.in/course/IGOT-STAT-204")
    provider: str = Field(default="iGOT Karmayogi / MoSPI", example="National Statistical Systems Training Academy (NSSTA)")
    duration_hours: int = Field(default=20, example=24)
    modules_count: int = Field(default=6, example=8)
    certification_badge: str = Field(default="Govt Certified", example="Official MoSPI")
    level: str = Field(default="Intermediate", example="Advanced")
    tpac_recommended: bool = Field(default=False, description="Recommended under NSSTA's Training Programme Advisory Committee (TPAC) curriculum")

class CourseResponse(BaseModel):
    total: int
    courses: List[CourseModel]
