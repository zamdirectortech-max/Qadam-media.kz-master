import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import _current_user
from app.db.base import get_db
from app.models.domain import ClientWorkspace, Content, ContentVariant, MediaAsset, PublicationStatus, ScheduledPost, SocialAccount, SocialPlatform, TeamMember, User
from app.schemas.calendar import ScheduledPostResponse

router = APIRouter(prefix="/calendar", tags=["calendar"])
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_MEDIA = {"image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"}
MAX_MEDIA_BYTES = 100 * 1024 * 1024


async def _workspace_id(db: AsyncSession, user_id: uuid.UUID) -> uuid.UUID:
    membership = await db.scalar(select(TeamMember).where(TeamMember.user_id == user_id))
    if not membership:
        raise HTTPException(status_code=403, detail="Workspace membership is missing")
    workspace = await db.scalar(select(ClientWorkspace).where(ClientWorkspace.organization_id == membership.organization_id))
    if not workspace:
        raise HTTPException(status_code=403, detail="Workspace is missing")
    return workspace.id


async def _owned_post(db: AsyncSession, post_id: uuid.UUID, workspace_id: uuid.UUID):
    row = (await db.execute(
        select(ScheduledPost, ContentVariant, Content)
        .join(ContentVariant, ScheduledPost.content_variant_id == ContentVariant.id)
        .join(Content, ContentVariant.content_id == Content.id)
        .where(ScheduledPost.id == post_id, Content.workspace_id == workspace_id)
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Scheduled post was not found")
    return row


async def _save_media(db: AsyncSession, workspace_id: uuid.UUID, platform: str, media: UploadFile) -> tuple[str, str]:
    if media.content_type not in ALLOWED_MEDIA:
        raise HTTPException(status_code=415, detail="Only JPG, PNG, WEBP, MP4 and MOV files are supported")
    body = await media.read(MAX_MEDIA_BYTES + 1)
    if len(body) > MAX_MEDIA_BYTES:
        raise HTTPException(status_code=413, detail="Media file must not exceed 100 MB")
    saved_name = f"{uuid.uuid4().hex}{Path(media.filename or '').suffix.lower()[:10]}"
    (UPLOAD_DIR / saved_name).write_bytes(body)
    media_url = f"/uploads/{saved_name}"
    db.add(MediaAsset(workspace_id=workspace_id, url=media_url, asset_type="video" if (media.content_type or "").startswith("video/") else "image", tags=[platform]))
    return media_url, str(media.filename)


async def _remove_media(db: AsyncSession, media_url: str | None) -> None:
    if not media_url:
        return
    await db.execute(delete(MediaAsset).where(MediaAsset.url == media_url))
    filename = Path(media_url).name
    target = (UPLOAD_DIR / filename).resolve()
    if target.parent == UPLOAD_DIR.resolve() and target.exists():
        target.unlink()


@router.get("/posts", response_model=list[ScheduledPostResponse])
async def list_scheduled_posts(start: datetime, end: datetime, user: User = Depends(_current_user), db: AsyncSession = Depends(get_db)) -> list[ScheduledPostResponse]:
    workspace_id = await _workspace_id(db, user.id)
    rows = (await db.execute(
        select(ScheduledPost, ContentVariant, Content)
        .join(ContentVariant, ScheduledPost.content_variant_id == ContentVariant.id)
        .join(Content, ContentVariant.content_id == Content.id)
        .where(Content.workspace_id == workspace_id, ScheduledPost.scheduled_for >= start, ScheduledPost.scheduled_for < end)
        .order_by(ScheduledPost.scheduled_for)
    )).all()
    return [ScheduledPostResponse(
        id=str(post.id), title=content.title, text=str((variant.payload or {}).get("text", "")),
        platform=variant.platform_code, scheduled_for=post.scheduled_for, status=post.status.value,
        media_url=(variant.payload or {}).get("media_url"), media_name=(variant.payload or {}).get("media_name"),
        can_auto_publish=bool((variant.payload or {}).get("can_auto_publish", False)),
    ) for post, variant, content in rows]


@router.post("/posts", response_model=ScheduledPostResponse, status_code=201)
async def create_scheduled_post(
    title: str = Form(..., min_length=2, max_length=220), text: str = Form(..., min_length=1, max_length=10000),
    platform: str = Form(..., min_length=2, max_length=64), scheduled_for: datetime = Form(...),
    media: UploadFile | None = File(default=None), user: User = Depends(_current_user), db: AsyncSession = Depends(get_db),
) -> ScheduledPostResponse:
    if scheduled_for.tzinfo is None:
        raise HTTPException(status_code=422, detail="Scheduled time must include a timezone")
    if scheduled_for.astimezone(timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Scheduled time must be in the future")
    workspace_id = await _workspace_id(db, user.id)
    media_url = media_name = None
    if media and media.filename:
        media_url, media_name = await _save_media(db, workspace_id, platform, media)
    connected = await db.scalar(select(SocialAccount.id).join(SocialPlatform, SocialAccount.platform_id == SocialPlatform.id).where(
        SocialAccount.workspace_id == workspace_id, SocialPlatform.code == platform.lower(), SocialAccount.status == "CONNECTED"))
    content = Content(workspace_id=workspace_id, title=title.strip(), source_text=text.strip(), language=user.locale, status=PublicationStatus.SCHEDULED)
    db.add(content)
    await db.flush()
    variant = ContentVariant(content_id=content.id, platform_code=platform.lower(), payload={"text": text.strip(), "media_url": media_url, "media_name": media_name, "can_auto_publish": bool(connected)})
    db.add(variant)
    await db.flush()
    post = ScheduledPost(content_variant_id=variant.id, scheduled_for=scheduled_for, status=PublicationStatus.SCHEDULED)
    db.add(post)
    await db.commit()
    return ScheduledPostResponse(id=str(post.id), title=content.title, text=text.strip(), platform=platform.lower(), scheduled_for=scheduled_for, status=post.status.value, media_url=media_url, media_name=media_name, can_auto_publish=bool(connected))


@router.patch("/posts/{post_id}", response_model=ScheduledPostResponse)
async def update_scheduled_post(
    post_id: uuid.UUID, title: str = Form(..., min_length=2, max_length=220), text: str = Form(..., min_length=1, max_length=10000),
    platform: str = Form(..., min_length=2, max_length=64), scheduled_for: datetime = Form(...),
    remove_media: bool = Form(default=False), media: UploadFile | None = File(default=None),
    user: User = Depends(_current_user), db: AsyncSession = Depends(get_db),
) -> ScheduledPostResponse:
    if scheduled_for.tzinfo is None or scheduled_for.astimezone(timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Scheduled time must be in the future and include a timezone")
    workspace_id = await _workspace_id(db, user.id)
    post, variant, content = await _owned_post(db, post_id, workspace_id)
    payload = dict(variant.payload or {})
    old_media_url = payload.get("media_url")
    if remove_media:
        await _remove_media(db, old_media_url)
        payload["media_url"] = payload["media_name"] = None
    if media and media.filename:
        await _remove_media(db, old_media_url)
        payload["media_url"], payload["media_name"] = await _save_media(db, workspace_id, platform, media)
    connected = await db.scalar(select(SocialAccount.id).join(SocialPlatform, SocialAccount.platform_id == SocialPlatform.id).where(
        SocialAccount.workspace_id == workspace_id, SocialPlatform.code == platform.lower(), SocialAccount.status == "CONNECTED"))
    content.title, content.source_text = title.strip(), text.strip()
    variant.platform_code = platform.lower()
    payload.update({"text": text.strip(), "can_auto_publish": bool(connected)})
    variant.payload = payload
    post.scheduled_for = scheduled_for
    await db.commit()
    return ScheduledPostResponse(id=str(post.id), title=content.title, text=text.strip(), platform=variant.platform_code, scheduled_for=post.scheduled_for, status=post.status.value, media_url=payload.get("media_url"), media_name=payload.get("media_name"), can_auto_publish=bool(connected))


@router.delete("/posts/{post_id}", status_code=204)
async def delete_scheduled_post(post_id: uuid.UUID, user: User = Depends(_current_user), db: AsyncSession = Depends(get_db)) -> None:
    workspace_id = await _workspace_id(db, user.id)
    post, variant, content = await _owned_post(db, post_id, workspace_id)
    await _remove_media(db, (variant.payload or {}).get("media_url"))
    await db.delete(post)
    await db.flush()
    await db.delete(variant)
    await db.flush()
    await db.delete(content)
    await db.commit()
