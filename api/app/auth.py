"""
Supabase authentication for FastAPI.

Verifies access tokens via Supabase's auth.get_user() endpoint,
which works with the current JWT signing key format.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client

from app.config import get_settings

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Validate a Supabase access token and return the user_id.

    Uses Supabase's auth.get_user() to verify the token server-side,
    which handles all signing key formats automatically.

    Raises 401 if the token is missing, expired, or invalid.
    """
    settings = get_settings()
    token = credentials.credentials
    try:
        # Create a client with the user's token to verify it
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        user_response = client.auth.get_user(token)
        user = user_response.user
        if not user or not user.id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return user.id
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {exc}",
        )
