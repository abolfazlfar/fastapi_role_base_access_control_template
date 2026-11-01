"""Token request/response schemas."""

from typing import List, Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Access and refresh token pair returned on login/refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Decoded token claims."""

    user_id: Optional[int] = None
    email: Optional[str] = None
    roles: List[str] = []
    permissions: List[str] = []


class RefreshRequest(BaseModel):
    """Refresh token request body (used when cookie is not available)."""

    refresh_token: str


class LogoutRequest(BaseModel):
    """Logout request body."""

    refresh_token: Optional[str] = None
