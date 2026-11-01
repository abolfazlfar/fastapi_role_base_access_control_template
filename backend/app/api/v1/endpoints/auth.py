"""Authentication endpoints."""

from fastapi import APIRouter, Cookie, Depends, Form, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import AuthService, AuthenticationError

router = APIRouter()


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set the refresh token as an HttpOnly, Secure, SameSite cookie."""
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key="refresh_token", path="/")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> Token:
    """Register a new user and issue an access + refresh token pair."""
    service = AuthService(session)
    try:
        access_token, refresh_token = await service.register(
            email=user_in.email,
            username=user_in.username,
            password=user_in.password,
        )
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    _set_refresh_cookie(response, refresh_token)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    email: str = Form(...),
    password: str = Form(...),
    session: AsyncSession = Depends(get_db),
) -> Token:
    """Authenticate a user and issue an access + refresh token pair."""
    service = AuthService(session)
    try:
        access_token, refresh_token = await service.login(email=email, password=password)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    _set_refresh_cookie(response, refresh_token)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/refresh", response_model=Token)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_db),
) -> Token:
    """Rotate the refresh token and issue a new access token pair.

    The refresh token is read from the HttpOnly cookie.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required"
        )

    service = AuthService(session)
    try:
        access_token, new_refresh_token = await service.refresh(
            refresh_token=refresh_token
        )
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    _set_refresh_cookie(response, new_refresh_token)
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Revoke all refresh tokens for the current user."""
    service = AuthService(session)
    await service.logout(user_id=current_user.id)
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserRead)
async def read_me(
    current_user=Depends(get_current_user),
) -> UserRead:
    """Return the currently authenticated user."""
    return current_user
