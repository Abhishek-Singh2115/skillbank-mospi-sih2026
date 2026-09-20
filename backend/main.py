import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import db_manager
from backend.routes import users_router, skills_router, quiz_router, courses_router, market_router, auth_router, admin_router
from backend.services.igot_service import igot_service

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skillbank.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: initializes DB connection and seeds default courses on startup."""
    logger.info("Initializing SkillBank Backend API...")
    await db_manager.connect()
    # Pre-seed default mock iGOT courses
    seeded_count = await igot_service.seed_courses()
    logger.info(f"iGOT Karmayogi catalog verified with {seeded_count} courses.")
    yield
    logger.info("Shutting down SkillBank Backend API...")
    await db_manager.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS) for React / HTML frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(skills_router, prefix=settings.API_V1_STR)
app.include_router(quiz_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
app.include_router(market_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health & Status"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "hackathon": "Smart India Hackathon (SIH 2026)",
        "problem_statement": "101 - Ministry of Statistics and Programme Implementation (MoSPI)",
        "documentation": "/docs",
        "status": "online"
    }

@app.get("/api/health", tags=["Health & Status"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected (MongoDB)" if db_manager.is_connected else "active (In-Memory Fallback Engine)",
        "gemini_ai": "live" if bool(settings.GEMINI_API_KEY) else "mock_engine_active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
