from app.models.domain import PublicationStatus
from app.services.social_connectors import get_connector


class PublishingService:
    async def publish_now(self, platform_code: str, account_id: str, payload: dict) -> dict:
        connector = get_connector(platform_code)
        try:
            result = await connector.publish(account_id, payload)
        except NotImplementedError as exc:
            return {
                "status": PublicationStatus.FAILED,
                "error": str(exc),
                "retryable": False,
            }

        return {
            "status": PublicationStatus.PUBLISHED,
            "external_post_id": result.external_post_id,
            "retryable": True,
        }
