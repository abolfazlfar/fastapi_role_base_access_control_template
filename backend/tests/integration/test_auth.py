"""Integration tests for authentication endpoints."""

from datetime import datetime, timedelta, timezone

import pytest

from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_register_success(client):
    payload = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "Secret123!",
    }
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "username": "dupuser", "password": "Secret123!"},
    )
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "username": "dupuser2", "password": "Secret123!"},
    )
    assert resp.status_code == 400, resp.text


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "Secret123!"},
    )
    resp = await client.post(
        "/api/v1/auth/login",
        data={"email": "login@example.com", "password": "Secret123!"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    resp = await client.post(
        "/api/v1/auth/login",
        data={"email": "none@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401, resp.text


@pytest.mark.asyncio
async def test_me_endpoint(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "me@example.com", "username": "meuser", "password": "Secret123!"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        data={"email": "me@example.com", "password": "Secret123!"},
    )
    token = login.json()["access_token"]
    resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_me_unauthorized(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "refresh@example.com", "username": "refreshuser", "password": "Secret123!"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        data={"email": "refresh@example.com", "password": "Secret123!"},
    )
    refresh_token = login.json()["refresh_token"]

    resp = await client.post(
        "/api/v1/auth/refresh",
        cookies={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # Rotation: new refresh token differs from the old
    assert data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_logout(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "logout@example.com", "username": "logoutuser", "password": "Secret123!"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        data={"email": "logout@example.com", "password": "Secret123!"},
    )
    token = login.json()["access_token"]

    resp = await client.post(
        "/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 204, resp.text

    # Access token still valid short-term but refresh tokens revoked
    refresh_token = login.json()["refresh_token"]
    resp2 = await client.post(
        "/api/v1/auth/refresh",
        cookies={"refresh_token": refresh_token},
    )
    assert resp2.status_code == 401


@pytest.mark.asyncio
async def test_access_token_expired(client):
    from app.core.config import settings
    # Create an already-expired token
    expired = create_access_token(
        subject="1",
        email="exp@example.com",
        roles=["user"],
        permissions=["profile:read"],
        expires_delta=timedelta(minutes=-5),
    )
    resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {expired}"}
    )
    assert resp.status_code == 401
