"""Role request/response schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = None


class RoleRead(RoleBase):
    id: int

    model_config = {"from_attributes": True}


class RoleWithPermissions(RoleRead):
    permissions: List[str] = []
