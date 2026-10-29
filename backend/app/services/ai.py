from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class PlatformVariant:
    platform: str
    payload: dict


class AIProvider(ABC):
    @abstractmethod
    async def generate_variants(self, source_text: str, language: str, tone: str) -> list[PlatformVariant]:
        raise NotImplementedError

    @abstractmethod
    async def analyze_image(self, image_url: str) -> dict:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    async def generate_variants(self, source_text: str, language: str, tone: str) -> list[PlatformVariant]:
        return [
            PlatformVariant("instagram", {"caption": source_text, "hashtags": ["#qadam", "#kazakhstan"], "visual_recommendation": "Bright product-first image"}),
            PlatformVariant("tiktok", {"hook": "Шымкент, это для вас", "script": "Fast opening montage with offer reveal", "caption": source_text}),
            PlatformVariant("telegram", {"post": source_text[:240]}),
            PlatformVariant("linkedin", {"post": f"Business update: {source_text}"}),
            PlatformVariant("whatsapp", {"message": source_text[:500], "format": "channel_or_broadcast"}),
            PlatformVariant("threads", {"post": source_text[:500], "format": "conversation_starter"}),
            PlatformVariant("vk", {"post": source_text, "format": "community_post"}),
            PlatformVariant("x", {"post": source_text[:280], "format": "short_post"}),
        ]

    async def analyze_image(self, image_url: str) -> dict:
        return {
            "objects": [],
            "product": None,
            "people": [],
            "scene": "unknown",
            "mood": "neutral",
            "target_audience": [],
            "text_on_image": "",
            "visual_elements": [],
            "suggestions": ["Instagram post", "Instagram Story", "TikTok script", "Telegram post", "promotion"],
        }


class OpenAIProvider(AIProvider):
    async def generate_variants(self, source_text: str, language: str, tone: str) -> list[PlatformVariant]:
        raise NotImplementedError("OpenAIProvider requires API key and production prompt templates")

    async def analyze_image(self, image_url: str) -> dict:
        raise NotImplementedError("OpenAIProvider requires vision model configuration")


def get_ai_provider() -> AIProvider:
    return MockAIProvider()
