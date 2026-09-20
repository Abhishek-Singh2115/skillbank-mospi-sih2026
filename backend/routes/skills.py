import re
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Depends
from pydantic import BaseModel
from backend.models.skill import SkillAnalysisRequest, SkillAnalysisResponse, RoleBenchmark
from backend.services.skill_service import skill_service
from backend.services.pdf_service import extract_text_from_pdf
from backend.services.gemini_service import gemini_service
from backend.database import db_manager
from backend.dependencies import get_current_user

logger = logging.getLogger("skillbank.skills")
router = APIRouter(prefix="/skills", tags=["Skill Gap Analyzer"])

@router.post("/analyze", response_model=SkillAnalysisResponse)
async def analyze_skill_gap(
    request: SkillAnalysisRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    target_role = request.target_role
    current_skills = request.current_skills
    degree = request.degree
    user_id = current_user["_id"]

    if not target_role:
        target_role = current_user.get("target_role")
    if not current_skills:
        current_skills = current_user.get("current_skills", [])
    if not degree:
        degree = current_user.get("degree")

    if not target_role:
        target_role = "MoSPI Statistical Data Analyst"
    if current_skills is None:
        current_skills = []

    analysis_req = SkillAnalysisRequest(
        user_id=user_id,
        target_role=target_role,
        current_skills=current_skills,
        degree=degree
    )

    response = await skill_service.generate_skill_analysis_response(analysis_req)

    # Persist analysis results to the user's MongoDB document.
    # We must persist the user's submitted current_skills, not just the matched ones.
    persist_fields = {
        "target_role": response.target_role,
        "current_skills": list(current_skills), # persist what user submitted
        "missing_skills": list(response.missing_skills or []),
        "readiness_score": response.readiness_score,
        "identified_gaps_count": len(response.missing_skills or []),
    }
    if request.designation is not None:
        persist_fields["designation"] = request.designation
    if request.department is not None:
        persist_fields["department"] = request.department
    if request.work_experience_years is not None:
        persist_fields["work_experience_years"] = request.work_experience_years

    users_col = db_manager.get_collection("users")
    await users_col.update_one(
        {"_id": user_id},
        {"$set": persist_fields}
    )

    return response

@router.get("/roles", response_model=List[RoleBenchmark])
async def get_role_benchmarks(current_user: Dict[str, Any] = Depends(get_current_user)):
    return skill_service.get_all_roles()

class ResumeExtractionResponse(BaseModel):
    filename: str
    skills: List[str]
    extracted_count: int
    characters_parsed: int
    engine: Optional[str] = "gemini"
    warning: Optional[str] = None

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/extract-resume", response_model=ResumeExtractionResponse)
async def extract_skills_from_resume(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid PDF document (.pdf)."
        )

    try:
        content = await file.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds 5MB limit."
            )
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded resume file is empty."
            )
            
        if file.filename.lower().endswith(".pdf"):
            if not content.startswith(b"%PDF"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid PDF file."
                )

        extracted_text = ""
        char_count = 0

        if file.filename.lower().endswith(".pdf"):
            try:
                extracted_text, char_count = extract_text_from_pdf(content)
            except Exception as pdf_err:
                logger.warning(f"pypdf extraction warning for {file.filename}. Attempting raw byte decode.")
                raw_decoded = content.decode("latin1", errors="ignore")
                extracted_text = " ".join(re.findall(r'[A-Za-z0-9+#\.\-_/]{3,}', raw_decoded))
                char_count = len(extracted_text)
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
            char_count = len(extracted_text)

        engine = "gemini"
        warning = None

        if char_count < 15:
            logger.info(f"Resume {file.filename} yielded minimal text ({char_count} chars).")
            skills = []
            engine = "fallback"
            warning = "Could not extract enough text from the resume."
        else:
            skills = await gemini_service.extract_skills_from_resume_text(extracted_text)
            if not skills:
                skills = []
                engine = "fallback"
                warning = "No skills were recognized from the provided resume text."

        return ResumeExtractionResponse(
            filename=file.filename,
            skills=skills,
            extracted_count=len(skills),
            characters_parsed=max(char_count, len(extracted_text)),
            engine=engine,
            warning=warning
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected resume parse error: {e}")
        return ResumeExtractionResponse(
            filename=file.filename,
            skills=[],
            extracted_count=0,
            characters_parsed=0,
            engine="fallback",
            warning="An unexpected error occurred during processing."
        )

