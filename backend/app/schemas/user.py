"""User request/response schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class UserRead(BaseModel):
    """Schema returned when reading a user."""

    id: int
    email: str
    username: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Schema for updating a user (partial)."""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=3, max_length=100)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserOut(BaseModel):
    """Public user representation used in token payloads and responses."""

    id: int
    email: str
    username: str
    is_active: bool
    is_superuser: bool
    roles: List[str] = []
    permissions: List[str] = []

    model_config = {"from_attributes": True}


class UserList(BaseModel):
    """Paginated list of users."""

    items: List[UserRead]
    total: int
    page: int
    page_size: int
    pages: int
