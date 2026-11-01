"""User management endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import (
    get_current_user,
    require_permissions,
    require_roles,
)
from app.schemas.user import UserList, UserRead, UserUpdate
from app.schemas.role import RoleRead
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def read_user_me(
    current_user=Depends(get_current_user),
) -> UserRead:
    """Return the currently authenticated user."""
    return current_user


@router.get("/", response_model=UserList)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_roles("admin", "manager")),
    session: AsyncSession = Depends(get_db),
) -> UserList:
    """List users with pagination. Admin or manager required."""
    service = UserService(session)
    skip = (page - 1) * page_size
    items, total = await service.get_multi(skip=skip, limit=page_size)
    pages = (total + page_size - 1) // page_size if total else 0
    return UserList(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{user_id}", response_model=UserRead)
async def read_user(
    user_id: int,
    current_user=Depends(require_roles("admin", "manager")),
    session: AsyncSession = Depends(get_db),
) -> UserRead:
    """Get a user by id. Admin or manager required."""
    service = UserService(session)
    user = await service.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    current_user=Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
) -> UserRead:
    """Update a user. Admin required. Regular users cannot modify others."""
    service = UserService(session)
    user = await service.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updated = await service.update(
        user,
        email=user_in.email,
        username=user_in.username,
        password=user_in.password,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
    )
    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user=Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Delete a user. Admin required."""
    service = UserService(session)
    user = await service.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await service.delete(user)


@router.post("/{user_id}/roles/{role_name}", response_model=RoleRead)
async def assign_role(
    user_id: int,
    role_name: str,
    current_user=Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
) -> RoleRead:
    """Assign a role to a user. Admin required."""
    service = UserService(session)
    user = await service.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user = await service.assign_role(user, role_name)
    role = await service.role_repo.get_by_name(role_name)
    return role


@router.delete("/{user_id}/roles/{role_name}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role(
    user_id: int,
    role_name: str,
    current_user=Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Remove a role from a user. Admin required."""
    service = UserService(session)
    user = await service.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await service.remove_role(user, role_name)
