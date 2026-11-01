"""Permission repository: database access for Permission model."""

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission


class PermissionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, permission_id: int) -> Optional[Permission]:
        result = await self.session.execute(
            select(Permission).where(Permission.id == permission_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Permission]:
        result = await self.session.execute(
            select(Permission).where(Permission.name == name)
        )
        return result.scalar_one_or_none()

    async def get_multi(self) -> List[Permission]:
        result = await self.session.execute(select(Permission))
        return list(result.scalars().all())

    async def create(
        self, *, name: str, description: Optional[str] = None
    ) -> Permission:
        permission = Permission(name=name, description=description)
        self.session.add(permission)
        await self.session.flush()
        await self.session.refresh(permission)
        return permission

    async def update(self, permission: Permission) -> Permission:
        self.session.add(permission)
        await self.session.flush()
        await self.session.refresh(permission)
        return permission

    async def delete(self, permission: Permission) -> None:
        await self.session.delete(permission)
        await self.session.flush()
