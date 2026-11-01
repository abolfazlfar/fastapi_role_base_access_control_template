"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.models import (
    user,
    association,
    refresh_token,
    role,
    permission,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        
    yield

    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description="Full-Stack Starter Template Backend (FastAPI, SQLAlchemy, PostgreSQL, JWT, RBAC)",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS configuration (explicit allowlist from environment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "env": settings.app_env}


@app.get("/", tags=["health"])
async def root() -> dict:
    """Root endpoint."""
    return {"message": "Full-Stack Starter Template Backend", "docs": "/docs"}


app.include_router(api_router, prefix=settings.api_v1_str)
