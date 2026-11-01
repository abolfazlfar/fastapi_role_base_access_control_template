"""Authentication service: login, register, refresh, logout business logic."""

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from uuid import uuid4

import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.repositories.refresh_token_repo import RefreshTokenRepository
from app.repositories.role_repo import RoleRepository
from app.repositories.user_repo import UserRepository


class AuthenticationError(Exception):
    """Raised when authentication fails."""


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repo = UserRepository(session)
        self.refresh_token_repo = RefreshTokenRepository(session)
        self.role_repo = RoleRepository(session)

    async def _get_user_roles_and_permissions(
        self, user: User
    ) -> Tuple[list[str], list[str]]:
        roles = [role.name for role in user.roles]
        permissions: list[str] = []
        for role in user.roles:
            for permission in role.permissions:
                if permission.name not in permissions:
                    permissions.append(permission.name)
        return roles, permissions

    async def _create_token_pair(self, user: User) -> Tuple[str, str]:
        roles, permissions = await self._get_user_roles_and_permissions(user)
        access_token = create_access_token(
            subject=str(user.id),
            email=user.email,
            roles=roles,
            permissions=permissions,
        )

        jti = str(uuid4())
        refresh_token_plain = create_refresh_token(
            subject=str(user.id),
            jti=jti,
        )
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )

        token_hash = get_password_hash(refresh_token_plain)

        await self.refresh_token_repo.create(
            user_id=user.id,
            jti=jti,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        return access_token, refresh_token_plain

    async def register(
        self, *, email: str, username: str, password: str
    ) -> Tuple[str, str]:
        """Register a new user and return (access_token, refresh_token)."""
        existing = await self.user_repo.get_by_email(email)
        if existing is not None:
            raise AuthenticationError("Email already registered")

        existing_user = await self.user_repo.get_by_username(username)
        if existing_user is not None:
            raise AuthenticationError("Username already taken")

        hashed_password = get_password_hash(password)
        user = await self.user_repo.create(
            email=email,
            username=username,
            hashed_password=hashed_password,
        )

        # Assign default "user" role
        default_role = await self.role_repo.get_by_name("user")
        if default_role is not None:
            user.roles.append(default_role)
            await self.session.flush()

        # Create access and refresh tokens
        tokens = await self._create_token_pair(user)

        # Commit user, role assignment and refresh token
        await self.session.commit()

        return tokens

    async def authenticate(self, email: str, password: str) -> User:
        """Verify credentials and return the user."""
        user = await self.user_repo.get_by_email(email)
        if user is None:
            raise AuthenticationError("Invalid credentials")
        if not user.is_active:
            raise AuthenticationError("Account is inactive")

        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid credentials")

        return user

    async def login(self, *, email: str, password: str) -> Tuple[str, str]:
        """Authenticate and issue a new token pair."""
        user = await self.authenticate(email=email, password=password)
        # Revoke all existing refresh tokens for this user (single session)
        await self.refresh_token_repo.revoke_all_for_user(user.id)
        # Create new token pair
        tokens = await self._create_token_pair(user)
        await self.session.commit()
        return tokens

    async def refresh(self, *, refresh_token: str) -> Tuple[str, str]:
        """Rotate refresh tokens: validate, revoke old, issue new pair.

        Detects reuse of revoked tokens and revokes the entire token family.
        """
        try:
            payload = decode_refresh_token(refresh_token)
        except Exception:
            raise AuthenticationError("Invalid refresh token")

        user_id = int(payload.get("sub"))
        jti = payload.get("jti")
        if jti is None:
            raise AuthenticationError("Invalid refresh token")

        result = await self.session.execute(
            select(RefreshToken).where(
                RefreshToken.jti == jti, RefreshToken.user_id == user_id
            )
        )
        token_row = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)

        if token_row is None:
            raise AuthenticationError("Invalid refresh token")

        if token_row.revoked_at is not None:
            # Token reuse detected: revoke all tokens for this user.
            await self.refresh_token_repo.revoke_all_for_user(user_id)
            raise AuthenticationError(
                "Refresh token reuse detected; all sessions revoked"
            )

        expires_at = token_row.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now:
            await self.refresh_token_repo.revoke(token_row)
            raise AuthenticationError("Refresh token expired")

        # Constant-time hash comparison of the presented token.
        if not verify_password(refresh_token, token_row.token_hash):
            raise AuthenticationError("Invalid refresh token")

        # Rotate: revoke old, issue new.
        await self.refresh_token_repo.revoke(token_row)

        user = await self.user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("User not found or inactive")

        return await self._create_token_pair(user)

    async def logout(self, *, user_id: int) -> None:
        """Revoke all refresh tokens for a user."""
        await self.refresh_token_repo.revoke_all_for_user(user_id)
