import logging
from typing import Dict, Any, Optional

from fastapi import Header, HTTPException, status, Depends

from backend.database import db_manager

logger = logging.getLogger("skillbank.auth.deps")

# ---------------------------------------------------------------------------
# Token format produced by auth.py:  google_token_{user_id}
# We parse the user_id from it and look the user up in the database.
# ---------------------------------------------------------------------------
_TOKEN_PREFIX = "google_token_"


async def get_current_user(
    authorization: Optional[str] = Header(
        default=None,
        description=(
            "Bearer token issued at login. "
            "Format: 'Bearer google_token_<user_id>'"
        ),
    )
) -> Dict[str, Any]:
    """
    FastAPI dependency -- resolves the Authorization header to a user document.

    Raises:
        HTTP 401  if the header is missing, malformed, or the user is not found.
    """
    # ── 1. Parse the raw header ──────────────────────────────────────────────
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

    # -- 2. Validate the token structure -------------------------------------
    if not token.startswith(_TOKEN_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unrecognised token format. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = token[len(_TOKEN_PREFIX):]
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a valid user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # -- 3. Look up the user in the database ---------------------------------
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

    Raises:
        HTTP 403  if the user's role is not 'admin'.
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
