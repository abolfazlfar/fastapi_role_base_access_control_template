"""Security utilities: password hashing and JWT token handling."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Argon2 via passlib. Constant-time comparison is handled by passlib verify.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2 hash using constant-time compare."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plaintext password with Argon2."""
    return pwd_context.hash(password)


def _create_token(
    *,
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    email: Optional[str] = None,
    roles: Optional[list[str]] = None,
    permissions: Optional[list[str]] = None,
    jti: Optional[str] = None,
) -> str:
    """Create a signed JWT token with standard claims.

    Validates signature, expiration, issuer, and audience on decode.
    """
    from uuid import uuid4

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload: Dict[str, Any] = {
        "sub": subject,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "exp": expire,
        "iat": now,
        "type": token_type,
        "jti": jti or str(uuid4()),
    }
    if email is not None:
        payload["email"] = email
    if roles is not None:
        payload["roles"] = roles
    if permissions is not None:
        payload["permissions"] = permissions

    encoded = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    return encoded


def create_access_token(
    *,
    subject: str,
    email: str,
    roles: list[str],
    permissions: list[str],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a short-lived JWT access token.

    Claims include: sub (user id), email, roles, permissions, iss, aud,
    exp, iat, jti, type=access.
    """
    return _create_token(
        subject=subject,
        token_type="access",
        email=email,
        roles=roles,
        permissions=permissions,
        expires_delta=expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(
    *,
    subject: str,
    jti: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a long-lived JWT refresh token.

    Claims include: sub (user id), iss, aud, exp, iat, jti, type=refresh.
    No email/roles/permissions to keep the refresh token compact.
    """
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=expires_delta
        if expires_delta is not None
        else timedelta(days=settings.refresh_token_expire_days),
        jti=jti,
    )


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate any JWT token.

    Validates signature, expiration, issuer, and audience.
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.algorithm],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={"require": ["exp", "iat", "iss", "aud", "sub", "jti", "type"]},
    )
    return payload


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token (type must be 'access')."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token")
    return payload


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT refresh token (type must be 'refresh')."""
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Not a refresh token")
    return payload
