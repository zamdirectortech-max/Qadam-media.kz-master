from fastapi import APIRouter

from app.schemas.content import GenerateContentRequest, ImageAnalysisRequest, PublishRequest
from app.services.ai import get_ai_provider
from app.services.publishing import PublishingService
from app.services.social_connectors import connectors
from app.api.integrations import router as integrations_router
from app.api.auth import router as auth_router
from app.api.calendar import router as calendar_router

router = APIRouter()
router.include_router(integrations_router)
router.include_router(auth_router)
router.include_router(calendar_router)


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "qadam-media-api"}


@router.get("/social/platforms")
async def social_platforms() -> list[dict]:
    display_names = {
        "whatsapp": "WhatsApp",
        "threads": "Threads",
        "vk": "VK / ВКонтакте",
        "x": "X / Twitter",
    }
    return [
        {
            "code": code,
            "name": display_names.get(code, code.replace("_", " ").title()),
            "status": "integration_coming_soon",
        }
        for code in connectors
    ]


@router.post("/ai/generate")
async def generate_content(request: GenerateContentRequest) -> dict:
    provider = get_ai_provider()
    variants = await provider.generate_variants(request.source_text, request.language, request.tone)
    return {"variants": [{"platform": item.platform, "payload": item.payload} for item in variants]}


@router.post("/ai/analyze-image")
async def analyze_image(request: ImageAnalysisRequest) -> dict:
    provider = get_ai_provider()
    return await provider.analyze_image(request.image_url)


@router.post("/publishing/publish")
async def publish(request: PublishRequest) -> dict:
    service = PublishingService()
    return await service.publish_now(request.platform_code, request.account_id, request.payload)
