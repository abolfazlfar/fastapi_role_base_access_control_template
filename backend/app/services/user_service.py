"""User service: user management business logic."""

from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User
from app.repositories.role_repo import RoleRepository
from app.repositories.user_repo import UserRepository


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repo = UserRepository(session)
        self.role_repo = RoleRepository(session)

    async def get_by_id(self, user_id: int) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def get_multi(
        self, *, skip: int = 0, limit: int = 100
    ) -> Tuple[List[User], int]:
        items = await self.user_repo.get_multi(skip=skip, limit=limit)
        total = await self.user_repo.count()
        return items, total

    async def update(
        self, user: User, *, email: Optional[str] = None,
        username: Optional[str] = None, password: Optional[str] = None,
        is_active: Optional[bool] = None, is_superuser: Optional[bool] = None,
    ) -> User:
        if email is not None:
            existing = await self.user_repo.get_by_email(email)
            if existing is not None and existing.id != user.id:
                raise ValueError("Email already in use")
            user.email = email
        if username is not None:
            existing = await self.user_repo.get_by_username(username)
            if existing is not None and existing.id != user.id:
                raise ValueError("Username already in use")
            user.username = username
        if password is not None:
            user.hashed_password = get_password_hash(password)
        if is_active is not None:
            user.is_active = is_active
        if is_superuser is not None:
            user.is_superuser = is_superuser

        return await self.user_repo.update(user)

    async def delete(self, user: User) -> None:
        await self.user_repo.delete(user)

    async def assign_role(self, user: User, role_name: str) -> User:
        role = await self.role_repo.get_by_name(role_name)
        if role is None:
            raise ValueError(f"Role '{role_name}' not found")
        if role not in user.roles:
            user.roles.append(role)
            await self.session.flush()
        return user

    async def remove_role(self, user: User, role_name: str) -> User:
        role = await self.role_repo.get_by_name(role_name)
        if role is not None and role in user.roles:
            user.roles.remove(role)
            await self.session.flush()
        return user

    async def get_user_roles(self, user: User) -> List[Role]:
        return list(user.roles)
