from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel, Field
from backend.models.quiz import QuizGenerationResponse, MCQQuestion
from backend.services.pdf_service import extract_text_from_pdf
from backend.services.gemini_service import gemini_service
from backend.config import settings

router = APIRouter(prefix="/quiz", tags=["AI Quiz Generator"])

@router.post("/generate", response_model=QuizGenerationResponse)
async def generate_quiz_from_pdf(file: UploadFile = File(...)):
    """
    Accepts an uploaded study material document (PDF), extracts curriculum concepts,
    and leverages Google Gemini API to formulate 5 Bloom's taxonomy MCQs in JSON format.
    """
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or text document (.txt)."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
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
        mcqs = await gemini_service.generate_mcqs_from_text(
            document_text=extracted_text,
            document_name=file.filename
        )

        return QuizGenerationResponse(
            document_name=file.filename,
            extracted_characters=char_count,
            questions_count=len(mcqs),
            source_model=settings.GEMINI_MODEL if gemini_service.api_key_configured else "Mock AI Engine (Configure GEMINI_API_KEY for Live Gemini)",
            questions=mcqs
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the AI quiz: {str(e)}"
        )

class TopicQuizRequest(BaseModel):
    topic: str = Field(..., example="Docker")

class TopicQuizResponse(BaseModel):
    topic: str
    questions_count: int
    source_model: str
    questions: List[MCQQuestion]

@router.post("/generate-topic", response_model=TopicQuizResponse)
async def generate_quiz_for_topic(request: TopicQuizRequest):
    """
    Instantly formulates 5 Bloom's taxonomy MCQs on a targeted competency gap (e.g. 'Docker', 'PostgreSQL')
    using Gemini AI to power the interactive testing modal in the Skill Gap Matrix.
    """
    clean_topic = request.topic.strip()
    if not clean_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic name cannot be empty."
        )

    try:
        mcqs = await gemini_service.generate_mcqs_for_topic(clean_topic)
        return TopicQuizResponse(
            topic=clean_topic,
            questions_count=len(mcqs),
            source_model=settings.GEMINI_MODEL if gemini_service.api_key_configured else "Intelligent Topic AI Engine",
            questions=mcqs
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate assessment questions for topic '{clean_topic}': {str(e)}"
        )

