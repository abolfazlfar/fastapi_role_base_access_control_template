"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings.

    All values are sourced from environment variables (or a .env file) with
    sensible defaults for local development. Secrets must never be hardcoded.
    """

    # Application
    app_name: str = Field(default="backend", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=True, alias="DEBUG")
    api_v1_str: str = Field(default="/api/v1", alias="API_V1_STR")

    # Server
    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://appuser:apppass@localhost:5432/appdb",
        alias="DATABASE_URL",
    )
    postgres_user: str = Field(default="appuser", alias="POSTGRES_USER")
    postgres_password: str = Field(default="apppass", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="appdb", alias="POSTGRES_DB")
    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")

    # JWT
    secret_key: str = Field(
        default="change-me-in-production-a-long-random-secret",
        alias="SECRET_KEY",
    )
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    jwt_issuer: str = Field(default="fullstack-starter", alias="JWT_ISSUER")
    jwt_audience: str = Field(default="fullstack-starter-client", alias="JWT_AUDIENCE")
    access_token_expire_minutes: int = Field(
        default=15, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(
        default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS"
    )

    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="CORS_ORIGINS",
    )

    # Security
    bcrypt_rounds: int = Field(default=12, alias="BCRYPT_ROUNDS")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()


settings = get_settings()
