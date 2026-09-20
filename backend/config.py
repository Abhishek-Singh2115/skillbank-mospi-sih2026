import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillBank Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "FastAPI & MongoDB Backend for MoSPI Skill Gap Analyzer & Learning Platform (SIH 2026 PS-101)"

    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "skillbank_db")

    # Google Gemini AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Google OAuth Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # JWT Session Secret
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "")

    # CORS Allowed Origins
    CORS_ORIGINS: list[str] = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "http://localhost:8000"
    ]

    class Config:
        case_sensitive = True

settings = Settings()

if not settings.GOOGLE_CLIENT_ID:
    raise ValueError("GOOGLE_CLIENT_ID environment variable is missing or empty. Please configure it in .env.")

if not settings.SESSION_SECRET or len(settings.SESSION_SECRET) < 32:
    raise ValueError("SESSION_SECRET environment variable is missing or under 32 characters. Please configure it in .env.")
