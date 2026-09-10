from backend.routes.users import router as users_router
from backend.routes.skills import router as skills_router
from backend.routes.quiz import router as quiz_router
from backend.routes.courses import router as courses_router
from backend.routes.market import router as market_router
from backend.routes.auth import router as auth_router
from backend.routes.admin import router as admin_router

__all__ = [
    "users_router",
    "skills_router",
    "quiz_router",
    "courses_router",
    "market_router",
    "auth_router",
    "admin_router"
]
