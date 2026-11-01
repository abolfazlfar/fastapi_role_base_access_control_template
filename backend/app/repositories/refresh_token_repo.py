"""Refresh token repository: database access for RefreshToken model."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: int) -> List[RefreshToken]:
        result = await self.session.execute(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_valid_by_user(self, user_id: int) -> Optional[RefreshToken]:
        now = datetime.now()
        result = await self.session.execute(
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.revoked_at.is_(None))
            .where(RefreshToken.expires_at > now)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        user_id: int,
        jti: str,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            jti=jti,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.session.add(token)
        await self.session.flush()
        await self.session.refresh(token)
        return token

    async def revoke(self, token: RefreshToken) -> RefreshToken:
        now = datetime.now()
        token.revoked_at = now
        self.session.add(token)
        await self.session.flush()
        await self.session.refresh(token)
        return token

    async def revoke_all_for_user(self, user_id: int) -> None:
        now = datetime.now()
        result = await self.session.execute(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        for token in result.scalars().all():
            if token.revoked_at is None:
                token.revoked_at = now
                self.session.add(token)
        await self.session.flush()
