import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Generic SQLAlchemy types keep production PostgreSQL support while allowing
# the local development server to use an embedded SQLite database.
JSONB = JSON
UUID = Uuid


class PublicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    PUBLISHED = "PUBLISHED"
    FAILED = "FAILED"
    SCHEDULED = "SCHEDULED"


class IntegrationStatus(str, enum.Enum):
    CONNECTED = "CONNECTED"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    PERMISSION_ERROR = "PERMISSION_ERROR"
    API_ERROR = "API_ERROR"
    RATE_LIMIT = "RATE_LIMIT"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
    NOT_CONNECTED = "NOT_CONNECTED"
    EXPIRED_TOKEN = "EXPIRED_TOKEN"
    PLATFORM_REJECTED = "PLATFORM_REJECTED"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"


class ErrorCategory(str, enum.Enum):
    AUTHENTICATION = "AUTHENTICATION"
    PERMISSION = "PERMISSION"
    CONFIGURATION = "CONFIGURATION"
    VALIDATION = "VALIDATION"
    RATE_LIMIT = "RATE_LIMIT"
    NETWORK = "NETWORK"
    TIMEOUT = "TIMEOUT"
    PLATFORM = "PLATFORM"
    CONTENT = "CONTENT"
    MEDIA = "MEDIA"
    SERVER = "SERVER"
    UNKNOWN = "UNKNOWN"


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), default="ru")
    role: Mapped[str] = mapped_column(String(32), default=UserRole.USER.value, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TeamMember(Base):
    __tablename__ = "team_members"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    role: Mapped[str] = mapped_column(String(32))


class ClientWorkspace(Base):
    __tablename__ = "client_workspaces"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String(160))


class Brand(Base):
    __tablename__ = "brands"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("client_workspaces.id"))
    name: Mapped[str] = mapped_column(String(160))
    tone_of_voice: Mapped[str | None] = mapped_column(Text)
    colors: Mapped[dict] = mapped_column(JSONB, default=dict)
    fonts: Mapped[dict] = mapped_column(JSONB, default=dict)
    audience: Mapped[str | None] = mapped_column(Text)


class SocialPlatform(Base):
    __tablename__ = "social_platforms"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(120))


class SocialAccount(Base):
    __tablename__ = "social_accounts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("client_workspaces.id"))
    platform_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("social_platforms.id"))
    external_account_id: Mapped[str | None] = mapped_column(String(255))
    encrypted_access_token: Mapped[str | None] = mapped_column(Text)
    encrypted_refresh_token: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="DISCONNECTED")


class IntegrationProvider(Base):
    __tablename__ = "integration_providers"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    documentation_url: Mapped[str] = mapped_column(Text)
    supports_oauth: Mapped[bool] = mapped_column(Boolean, default=True)
    supports_webhooks: Mapped[bool] = mapped_column(Boolean, default=False)


class IntegrationConfig(Base):
    __tablename__ = "integration_configs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("integration_providers.id"))
    environment: Mapped[str] = mapped_column(String(24), default="development")
    api_version: Mapped[str | None] = mapped_column(String(40))
    redirect_uri: Mapped[str | None] = mapped_column(Text)
    scopes: Mapped[list[str]] = mapped_column(JSONB, default=list)
    encrypted_credentials: Mapped[str] = mapped_column(Text)
    status: Mapped[IntegrationStatus] = mapped_column(Enum(IntegrationStatus), default=IntegrationStatus.NOT_CONNECTED)


class TikTokIntegrationConfig(Base):
    __tablename__ = "tiktok_integration_configs"
    id: Mapped[uuid.UUID] = mapped_column(ForeignKey("integration_configs.id"), primary_key=True)
    client_key_hint: Mapped[str | None] = mapped_column(String(16))


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    social_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("social_accounts.id"), unique=True)
    encrypted_access_token: Mapped[str] = mapped_column(Text)
    encrypted_refresh_token: Mapped[str | None] = mapped_column(Text)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    scopes: Mapped[list[str]] = mapped_column(JSONB, default=list)


class ApiRequestLog(Base):
    __tablename__ = "api_request_logs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    platform: Mapped[str] = mapped_column(String(64), index=True)
    endpoint: Mapped[str] = mapped_column(Text)
    method: Mapped[str] = mapped_column(String(10))
    status_code: Mapped[int | None] = mapped_column(Integer)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    organization_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"), index=True)
    social_account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("social_accounts.id"))
    error_code: Mapped[str | None] = mapped_column(String(160))
    sanitized_request: Mapped[dict] = mapped_column(JSONB, default=dict)
    sanitized_response: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ApiError(Base):
    __tablename__ = "api_errors"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_log_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("api_request_logs.id"), unique=True)
    category: Mapped[ErrorCategory] = mapped_column(Enum(ErrorCategory))
    status: Mapped[IntegrationStatus] = mapped_column(Enum(IntegrationStatus))
    message: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    recommended_solution: Mapped[str] = mapped_column(Text)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("integration_providers.id"))
    event_type: Mapped[str] = mapped_column(String(160))
    request_id: Mapped[str] = mapped_column(String(40), index=True)
    sanitized_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class IntegrationHealth(Base):
    __tablename__ = "integration_health"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("integration_configs.id"), unique=True)
    success_rate: Mapped[int] = mapped_column(Integer, default=0)
    average_response_ms: Mapped[int] = mapped_column(Integer, default=0)
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_failure_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class IntegrationPermission(Base):
    __tablename__ = "integration_permissions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    social_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("social_accounts.id"), index=True)
    scope: Mapped[str] = mapped_column(String(180))
    granted: Mapped[bool] = mapped_column(Boolean, default=False)


class IntegrationTest(Base):
    __tablename__ = "integration_tests"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("integration_configs.id"), index=True)
    check_name: Mapped[str] = mapped_column(String(80))
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    request_id: Mapped[str] = mapped_column(String(40), index=True)
    details: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Content(Base):
    __tablename__ = "content"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("client_workspaces.id"))
    title: Mapped[str] = mapped_column(String(220))
    source_text: Mapped[str | None] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(8), default="ru")
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.DRAFT)
    variants: Mapped[list["ContentVariant"]] = relationship(back_populates="content")


class ContentVariant(Base):
    __tablename__ = "content_variants"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("content.id"))
    platform_code: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict] = mapped_column(JSONB)
    content: Mapped[Content] = relationship(back_populates="variants")


class MediaAsset(Base):
    __tablename__ = "media_assets"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("client_workspaces.id"))
    url: Mapped[str] = mapped_column(Text)
    asset_type: Mapped[str] = mapped_column(String(32))
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list)


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_variant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("content_variants.id"))
    scheduled_for: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[PublicationStatus] = mapped_column(Enum(PublicationStatus), default=PublicationStatus.SCHEDULED)
    last_error: Mapped[str | None] = mapped_column(Text)


class PublishedPost(Base):
    __tablename__ = "published_posts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheduled_post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scheduled_posts.id"))
    external_post_id: Mapped[str] = mapped_column(String(255))
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Analytics(Base):
    __tablename__ = "analytics"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    published_post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("published_posts.id"))
    metrics: Mapped[dict] = mapped_column(JSONB, default=dict)


class Subscription(Base):
    __tablename__ = "subscriptions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    plan: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32))
    trial_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    trial_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    current_period_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("subscriptions.id"))
    amount_cents: Mapped[int] = mapped_column(Integer)
    provider_reference: Mapped[str | None] = mapped_column(String(255))


class AIUsage(Base):
    __tablename__ = "ai_usage"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    provider: Mapped[str] = mapped_column(String(80))
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(120))
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
