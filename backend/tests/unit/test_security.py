"""Unit tests for security utilities."""

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, get_password_hash, verify_password


def test_password_hash_and_verify():
    hashed = get_password_hash("secret123")
    assert hashed != "secret123"
    assert verify_password("secret123", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_access_token_roundtrip():
    token = create_access_token(
        subject="1",
        email="user@example.com",
        roles=["user"],
        permissions=["profile:read"],
    )
    payload = decode_access_token(token)
    assert payload["sub"] == "1"
    assert payload["email"] == "user@example.com"
    assert "user" in payload["roles"]
    assert "profile:read" in payload["permissions"]
    assert payload["iss"] == settings.jwt_issuer
    assert payload["aud"] == settings.jwt_audience


def test_access_token_claims():
    token = create_access_token(
        subject="42",
        email="admin@example.com",
        roles=["admin"],
        permissions=["users:write"],
    )
    payload = decode_access_token(token)
    assert payload["iss"] == settings.jwt_issuer
    assert payload["aud"] == settings.jwt_audience
    assert "exp" in payload
    assert "iat" in payload
