from pydantic import BaseModel, Field


class GenerateContentRequest(BaseModel):
    source_text: str = Field(min_length=1)
    language: str = "ru"
    tone: str = "Professional"


class ImageAnalysisRequest(BaseModel):
    image_url: str


class PublishRequest(BaseModel):
    platform_code: str
    account_id: str
    payload: dict
