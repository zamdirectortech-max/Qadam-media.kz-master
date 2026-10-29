from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class PublishResult:
    external_post_id: str


class SocialConnector(ABC):
    platform_code: str

    @abstractmethod
    async def build_oauth_url(self, state: str) -> str:
        raise NotImplementedError

    @abstractmethod
    async def publish(self, account_id: str, payload: dict) -> PublishResult:
        raise NotImplementedError


class ComingSoonConnector(SocialConnector):
    def __init__(self, platform_code: str) -> None:
        self.platform_code = platform_code

    async def build_oauth_url(self, state: str) -> str:
        raise NotImplementedError(f"{self.platform_code} OAuth integration coming soon")

    async def publish(self, account_id: str, payload: dict) -> PublishResult:
        raise NotImplementedError(f"{self.platform_code} publishing integration coming soon")


class InstagramConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("instagram")


class FacebookConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("facebook")


class TikTokConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("tiktok")


class TelegramConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("telegram")


class YouTubeConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("youtube")


class LinkedInConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("linkedin")


class WhatsAppConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("whatsapp")


class ThreadsConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("threads")


class VKConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("vk")


class XConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("x")


class GoogleBusinessConnector(ComingSoonConnector):
    def __init__(self) -> None:
        super().__init__("google_business")


connectors: dict[str, SocialConnector] = {
    connector.platform_code: connector
    for connector in [
        InstagramConnector(),
        FacebookConnector(),
        TikTokConnector(),
        TelegramConnector(),
        YouTubeConnector(),
        LinkedInConnector(),
        WhatsAppConnector(),
        ThreadsConnector(),
        VKConnector(),
        XConnector(),
        GoogleBusinessConnector(),
    ]
}


def get_connector(platform_code: str) -> SocialConnector:
    return connectors.get(platform_code, ComingSoonConnector(platform_code))
