from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    locale: str = Field(default="ru", pattern="^(ru|kk|en)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    locale: str
    role: str
    organization_id: str
    workspace_id: str
    plan: str
    subscription_status: str
    trial_ends_at: datetime | None


class AuthResponse(BaseModel):
    user: UserResponse
