from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from pydantic import BaseModel, Field
from backend.models.quiz import QuizGenerationResponse, MCQQuestion
from backend.services.pdf_service import extract_text_from_pdf
from backend.services.gemini_service import gemini_service
from backend.config import settings
from backend.dependencies import get_current_user

router = APIRouter(prefix="/quiz", tags=["AI Quiz Generator"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/generate", response_model=QuizGenerationResponse)
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or text document (.txt)."
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
                detail="Uploaded file is empty."
            )

        if file.filename.lower().endswith(".pdf"):
            if not content.startswith(b"%PDF"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid PDF file."
                )

        if file.filename.lower().endswith(".pdf"):
            extracted_text, char_count = extract_text_from_pdf(content)
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
            char_count = len(extracted_text)

        if char_count < 20:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Insufficient text extracted from the document to construct meaningful assessment questions."
            )

        # Invoke Gemini AI service
        try:
            mcqs = await gemini_service.generate_mcqs_from_text(
                document_text=extracted_text,
                document_name=file.filename
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Quiz generation failed."
            )

        return QuizGenerationResponse(
            document_name=file.filename,
            extracted_characters=char_count,
            questions_count=len(mcqs),
            source_model="gemini",
            questions=mcqs
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the AI quiz."
        )

class TopicQuizRequest(BaseModel):
    topic: str = Field(..., example="Docker")

class TopicQuizResponse(BaseModel):
    topic: str
    questions_count: int
    source_model: str
    questions: List[MCQQuestion]
    engine: Optional[str] = None

@router.post("/generate-topic", response_model=TopicQuizResponse)
async def generate_quiz_for_topic(
    request: TopicQuizRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    clean_topic = request.topic.strip()
    if not clean_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic name cannot be empty."
        )

    try:
        mcqs, engine = await gemini_service.generate_mcqs_for_topic(clean_topic)
        return TopicQuizResponse(
            topic=clean_topic,
            questions_count=len(mcqs),
            source_model=engine,
            questions=mcqs,
            engine=engine
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate assessment questions for topic."
        )

