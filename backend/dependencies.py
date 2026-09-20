import logging
from typing import Dict, Any, Optional
import jwt

from fastapi import Header, HTTPException, status, Depends

from backend.database import db_manager
from backend.config import settings

logger = logging.getLogger("skillbank.auth.deps")

async def get_current_user(
    authorization: Optional[str] = Header(
        default=None,
        description="Bearer token issued at login."
    )
) -> Dict[str, Any]:
    """
    FastAPI dependency -- resolves the Authorization header to a user document.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1].strip()

    try:
        payload = jwt.decode(token, settings.SESSION_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token missing subject claim.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    collection = db_manager.get_collection("users")
    user_doc = await collection.find_one({"_id": user_id})

    if not user_doc:
        logger.warning(
            f"get_current_user: no user found for id='{user_id}' "
            f"(token may be stale or from a different environment)"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_doc

async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    FastAPI dependency -- asserts that the authenticated user has role='admin'.
    """
    role = current_user.get("role", "learner")
    if role != "admin":
        logger.warning(
            f"require_admin: FORBIDDEN -- user '{current_user.get('email', 'unknown')}' "
            f"(role='{role}') attempted to access an admin-only resource."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator role required for this resource.",
        )
    return current_user
