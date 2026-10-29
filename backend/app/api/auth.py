import uuid
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.base import get_db
from app.models.domain import ClientWorkspace, Organization, Subscription, TeamMember, User, UserRole
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _is_configured_admin(email: str) -> bool:
    configured = {item.strip().lower() for item in settings.admin_emails.split(",") if item.strip()}
    return email.lower() in configured


async def _sync_configured_admin(db: AsyncSession, user: User) -> User:
    if _is_configured_admin(user.email) and user.role != UserRole.SUPER_ADMIN.value:
        user.role = UserRole.SUPER_ADMIN.value
        await db.commit()
        await db.refresh(user)
    return user


def _set_auth_cookies(response: Response, user_id: uuid.UUID) -> None:
    common = {"httponly": True, "secure": settings.cookie_secure, "samesite": "lax", "path": "/"}
    response.set_cookie("qadam_access", create_access_token(str(user_id)), max_age=settings.access_token_minutes * 60, **common)
    response.set_cookie("qadam_refresh", create_refresh_token(str(user_id)), max_age=settings.refresh_token_days * 86400, **common)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("qadam_access", path="/")
    response.delete_cookie("qadam_refresh", path="/")


async def _current_user(qadam_access: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)) -> User:
    if not qadam_access:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        user_id = uuid.UUID(decode_token(qadam_access, "access"))
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is not available")
    return await _sync_configured_admin(db, user)


async def require_admin(user: User = Depends(_current_user)) -> User:
    if user.role not in {UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return user


async def _user_payload(db: AsyncSession, user: User) -> UserResponse:
    membership = await db.scalar(select(TeamMember).where(TeamMember.user_id == user.id))
    if not membership:
        raise HTTPException(status_code=500, detail="Workspace membership is missing")
    workspace = await db.scalar(select(ClientWorkspace).where(ClientWorkspace.organization_id == membership.organization_id))
    subscription = await db.scalar(select(Subscription).where(Subscription.organization_id == membership.organization_id))
    if not workspace or not subscription:
        raise HTTPException(status_code=500, detail="Workspace setup is incomplete")
    return UserResponse(
        id=str(user.id), full_name=user.full_name, email=user.email, locale=user.locale, role=user.role,
        organization_id=str(membership.organization_id), workspace_id=str(workspace.id),
        plan=subscription.plan, subscription_status=subscription.status,
        trial_ends_at=subscription.trial_ends_at,
    )


async def _provision_workspace(db: AsyncSession, user: User) -> None:
    now = datetime.now(timezone.utc)
    trial_ends_at = now + timedelta(days=12)
    organization = Organization(name=f"{user.full_name} workspace")
    db.add_all([user, organization])
    await db.flush()
    db.add_all([
        TeamMember(user_id=user.id, organization_id=organization.id, role="OWNER"),
        ClientWorkspace(organization_id=organization.id, name="Основное рабочее пространство"),
        Subscription(
            organization_id=organization.id, plan="PRO", status="TRIAL",
            trial_started_at=now, trial_ends_at=trial_ends_at, current_period_ends_at=trial_ends_at,
        ),
    ])
    await db.commit()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower().strip()
    if await db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, full_name=payload.full_name.strip(), hashed_password=hash_password(payload.password), locale=payload.locale, role=UserRole.USER.value)
    await _provision_workspace(db, user)
    _set_auth_cookies(response, user.id)
    return AuthResponse(user=await _user_payload(db, user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    user = await db.scalar(select(User).where(User.email == payload.email.lower().strip()))
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    user = await _sync_configured_admin(db, user)
    _set_auth_cookies(response, user.id)
    return AuthResponse(user=await _user_payload(db, user))


@router.post("/refresh", response_model=AuthResponse)
async def refresh(response: Response, qadam_refresh: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)) -> AuthResponse:
    if not qadam_refresh:
        raise HTTPException(status_code=401, detail="Refresh token is missing")
    try:
        user_id = uuid.UUID(decode_token(qadam_refresh, "refresh"))
    except (ValueError, TypeError):
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User is not available")
    _set_auth_cookies(response, user.id)
    return AuthResponse(user=await _user_payload(db, user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    _clear_auth_cookies(response)


@router.get("/me", response_model=AuthResponse)
async def me(user: User = Depends(_current_user), db: AsyncSession = Depends(get_db)) -> AuthResponse:
    return AuthResponse(user=await _user_payload(db, user))


@router.get("/google")
async def google_start() -> RedirectResponse:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured yet")
    state = secrets.token_urlsafe(32)
    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    })
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")
    response.set_cookie("google_oauth_state", state, max_age=600, httponly=True, secure=settings.cookie_secure, samesite="lax", path="/")
    return response


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    response: Response,
    google_oauth_state: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    if not google_oauth_state or not secrets.compare_digest(state, google_oauth_state):
        raise HTTPException(status_code=400, detail="Invalid Google OAuth state")
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        })
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Google authorization code exchange failed")
    token_data = token_response.json()
    try:
        claims = google_id_token.verify_oauth2_token(token_data["id_token"], google_requests.Request(), settings.google_client_id)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail="Invalid Google identity token") from exc
    if not claims.get("email_verified") or not claims.get("email") or not claims.get("sub"):
        raise HTTPException(status_code=400, detail="Google email is not verified")
    email = str(claims["email"]).lower()
    user = await db.scalar(select(User).where((User.google_sub == str(claims["sub"])) | (User.email == email)))
    if user:
        if not user.google_sub:
            user.google_sub = str(claims["sub"])
            await db.commit()
    else:
        user = User(
            email=email,
            full_name=str(claims.get("name") or email.split("@", 1)[0]),
            hashed_password=None,
            google_sub=str(claims["sub"]),
            locale="ru",
            role=UserRole.USER.value,
        )
        await _provision_workspace(db, user)
    user = await _sync_configured_admin(db, user)
    destination = "/admin" if user.role in {UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value} else "/dashboard"
    redirect = RedirectResponse(f"{settings.frontend_url}{destination}")
    _set_auth_cookies(redirect, user.id)
    redirect.delete_cookie("google_oauth_state", path="/")
    return redirect
