from typing import List, Optional
from pydantic import BaseModel, Field

class MCQOption(BaseModel):
    key: str = Field(..., example="A")
    text: str = Field(..., example="Concurrent Rendering yields execution to the main thread")

class MCQQuestion(BaseModel):
    id: int = Field(..., example=1)
    question: str = Field(..., example="In React 18, what is the core benefit of Concurrent Rendering?")
    options: List[str] = Field(..., min_length=4, max_length=4, description="List of 4 distinct choices")
    correct_index: int = Field(..., ge=0, le=3, description="0-indexed position of the correct answer")
    correct_answer: str = Field(..., description="Full text of the correct choice")
    explanation: str = Field(..., description="Pedagogical explanation of why this answer is correct")
    topic: Optional[str] = Field(default="Curriculum Concept", example="Modern Web Architecture")

class QuizGenerationResponse(BaseModel):
    document_name: str
    extracted_characters: int
    questions_count: int
    source_model: str
    questions: List[MCQQuestion]
