from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "QADAM MEDIA API"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://qadam:qadam@localhost:5432/qadam"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "change-me"
    access_token_minutes: int = 30
    refresh_token_days: int = 30
    cookie_secure: bool = False
    frontend_url: str = "http://localhost:3000"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    oauth_token_encryption_key: str = "change-me"
    ai_provider: str = "mock"
    admin_emails: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
