import json
from collections.abc import Mapping
from typing import Any

from app.core.security import TokenCipher

SENSITIVE_KEYS = {"authorization", "cookie", "password", "access_token", "refresh_token", "client_secret", "client-secret", "bot_token"}


def redact(value: Any) -> Any:
    if isinstance(value, Mapping):
        return {key: "[REDACTED]" if key.lower() in SENSITIVE_KEYS else redact(item) for key, item in value.items()}
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


class SecretStore:
    def __init__(self) -> None:
        self.cipher = TokenCipher.from_settings()

    def encrypt_credentials(self, credentials: dict[str, str]) -> str:
        return self.cipher.encrypt(json.dumps(credentials))

    def decrypt_credentials(self, encrypted: str) -> dict[str, str]:
        return json.loads(self.cipher.decrypt(encrypted))
