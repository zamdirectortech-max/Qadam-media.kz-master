import asyncio
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Awaitable, Callable, TypeVar

T = TypeVar("T")


def request_id() -> str:
    return f"QDM-{datetime.now(timezone.utc):%Y%m%d}-{secrets.token_hex(3).upper()}"


class RetryManager:
    RETRYABLE_STATUS = {408, 429, 500, 502, 503, 504}

    async def run(self, operation: Callable[[], Awaitable[T]], status_of: Callable[[T], int], attempts: int = 3) -> T:
        result = await operation()
        for attempt in range(1, attempts):
            if status_of(result) not in self.RETRYABLE_STATUS:
                return result
            await asyncio.sleep(0.25 * (2 ** (attempt - 1)))
            result = await operation()
        return result


@dataclass(frozen=True)
class ErrorExplanation:
    status: str
    category: str
    explanation: str
    steps: list[str]


class ErrorManager:
    def analyze(self, http_status: int | None, code: str | None, message: str) -> ErrorExplanation:
        normalized = message.lower()
        if http_status == 401:
            return ErrorExplanation("AUTHENTICATION_ERROR", "AUTHENTICATION", "The platform rejected the credentials or token.", ["Validate application credentials", "Reconnect the account", "Check token expiration"])
        if http_status == 403 or "permission" in normalized:
            return ErrorExplanation("PERMISSION_ERROR", "PERMISSION", "The platform did not grant a required permission.", ["Check requested scopes", "Verify application approval", "Reconnect and approve permissions"])
        if http_status == 429:
            return ErrorExplanation("RATE_LIMIT", "RATE_LIMIT", "The platform request limit was reached.", ["Wait for the reset period", "Reduce request frequency", "Review platform quotas"])
        if http_status and http_status >= 500:
            return ErrorExplanation("API_ERROR", "SERVER", "The platform API is temporarily unavailable.", ["Retry later", "Check the official platform status"])
        return ErrorExplanation("UNKNOWN_ERROR", "UNKNOWN", message or "The platform returned an unclassified error.", ["Review the sanitized response", "Use the request ID when contacting support"])


class IntegrationManager:
    REDIRECT_URIS = {"tiktok": "https://qadam-media.kz/api/integrations/tiktok/callback"}

    def public_status(self, platform: str) -> dict:
        return {"platform": platform, "status": "NOT_CONNECTED", "api_status": "NOT_TESTED", "oauth_status": "NOT_CONNECTED", "api_version": "v2" if platform == "tiktok" else "UNCONFIGURED", "redirect_uri": self.REDIRECT_URIS.get(platform, f"https://qadam-media.kz/api/integrations/{platform}/callback"), "credentials_configured": False}
