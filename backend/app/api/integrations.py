from fastapi import APIRouter, Depends, HTTPException
from app.api.auth import require_admin

from app.schemas.integrations import ConnectionTestResult, IntegrationPublic, TikTokConfigInput
from app.services.integration_manager import IntegrationManager, request_id

router = APIRouter(prefix="/integrations", tags=["integrations"], dependencies=[Depends(require_admin)])
manager = IntegrationManager()


@router.get("", response_model=list[IntegrationPublic])
async def list_integrations() -> list[dict]:
    return [manager.public_status(code) for code in ["tiktok", "instagram", "facebook", "telegram", "youtube", "linkedin", "whatsapp", "threads", "vk", "x", "google_business"]]


@router.get("/{platform}", response_model=IntegrationPublic)
async def get_integration(platform: str) -> dict:
    return manager.public_status(platform)


@router.put("/tiktok/config")
async def configure_tiktok(payload: TikTokConfigInput) -> dict:
    # Persistence requires an authenticated organization and database session.
    # SecretStr prevents accidental serialization in logs or responses.
    if payload.redirect_uri != manager.REDIRECT_URIS["tiktok"]:
        raise HTTPException(status_code=422, detail="Redirect URI mismatch")
    raise HTTPException(status_code=501, detail="Secure database persistence is not configured")


@router.post("/tiktok/test", response_model=ConnectionTestResult)
async def test_tiktok_connection() -> dict:
    return {"request_id": request_id(), "success": False, "status": "CONFIGURATION_ERROR", "http_status": None, "error_code": "CONFIG_MISSING", "message": "TikTok credentials are not configured", "explanation": "A real API request cannot be made until encrypted credentials are saved.", "recommended_solution": ["Configure Client ID and Client Secret", "Validate the redirect URI", "Start OAuth connection"]}


@router.get("/tiktok/connect")
async def connect_tiktok() -> dict:
    raise HTTPException(status_code=409, detail="TikTok credentials are not configured")


@router.get("/tiktok/callback")
async def tiktok_callback(code: str | None = None, state: str | None = None) -> dict:
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing OAuth code or state")
    raise HTTPException(status_code=501, detail="OAuth token exchange requires configured TikTok credentials")
