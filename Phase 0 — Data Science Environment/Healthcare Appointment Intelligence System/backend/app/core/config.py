from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Healthcare Appointment Intelligence System"
    api_version: str = "v1"
    debug: bool = False

    # MongoDB (Atlas)
    mongodb_url: str = ""
    database_name: str = "healthcare_intelligence"

    # Auth / JWT
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # CORS
    frontend_url: str = "http://localhost:5173"

    # ML model paths (relative to the backend/app directory)
    no_show_model_path: str = "../../no_show_model.pkl"
    waiting_time_model_path: str = "../../waiting_time_model.pkl"


@lru_cache
def get_settings() -> Settings:
    return Settings()
