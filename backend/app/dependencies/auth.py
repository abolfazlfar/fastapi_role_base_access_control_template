"""Authentication and authorization dependencies."""

from typing import Annotated, Iterable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate the Bearer access token, returning the current user."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = int(payload.get("sub"))
    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # Attach roles and permissions from the token for convenience.
    user.roles_token = payload.get("roles", [])  # type: ignore[attr-defined]
    user.permissions_token = payload.get("permissions", [])  # type: ignore[attr-defined]
    return user


async def require_authenticated_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure the request is authenticated (alias for get_current_user)."""
    return current_user


def require_roles(*required_roles: str):
    """Dependency factory: require the user to have at least one of the roles."""

    async def dependency(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        user_roles: List[str] = getattr(current_user, "roles_token", [])
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role",
            )
        return current_user

    return dependency


def require_permissions(*required_permissions: str):
    """Dependency factory: require the user to have at least one of the permissions."""

    async def dependency(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        user_permissions: List[str] = getattr(
            current_user, "permissions_token", []
        )
        if not any(
            perm in user_permissions for perm in required_permissions
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permission",
            )
        return current_user

    return dependency
