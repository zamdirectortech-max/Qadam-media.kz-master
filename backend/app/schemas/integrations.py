from typing import Literal

from pydantic import BaseModel, Field, SecretStr


Environment = Literal["development", "staging", "production"]


class TikTokConfigInput(BaseModel):
    client_id: str = Field(min_length=3)
    client_secret: SecretStr
    redirect_uri: str
    api_version: str = "v2"
    scopes: list[str] = ["user.info.basic", "video.publish"]
    environment: Environment = "development"


class IntegrationPublic(BaseModel):
    platform: str
    status: str
    api_status: str
    oauth_status: str
    api_version: str
    redirect_uri: str
    credentials_configured: bool


class ConnectionTestResult(BaseModel):
    request_id: str
    success: bool
    status: str
    http_status: int | None = None
    error_code: str | None = None
    message: str
    explanation: str | None = None
    recommended_solution: list[str] = []
