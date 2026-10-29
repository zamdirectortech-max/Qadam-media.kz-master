from datetime import datetime

from pydantic import BaseModel


class ScheduledPostResponse(BaseModel):
    id: str
    title: str
    text: str
    platform: str
    scheduled_for: datetime
    status: str
    media_url: str | None
    media_name: str | None
    can_auto_publish: bool
