"""Permission request/response schemas."""

from typing import Optional

from pydantic import BaseModel, Field


class PermissionBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = None


class PermissionRead(PermissionBase):
    id: int

    model_config = {"from_attributes": True}
