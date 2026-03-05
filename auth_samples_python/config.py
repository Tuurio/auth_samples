import os
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()


def _normalize_authority(value: str | None) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


def _normalize_url(value: str | None) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    return raw


def _sanitize_client_id(value: str | None) -> str | None:
    raw = str(value or "").strip()
    if not raw or len(raw) > 120:
        return None
    for char in raw:
        if not (char.isalnum() or char in "._-"):
            return None
    return raw


def _sanitize_scope(value: str | None) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    cleaned_parts = []
    for part in raw.split():
        if all(ch.isalnum() or ch in "._:-" for ch in part):
            cleaned_parts.append(part)
    if not cleaned_parts:
        return None
    return " ".join(cleaned_parts)


AUTHORITY = _normalize_authority(os.getenv("TUURIO_ISSUER")) or "https://test.id.tuurio.com"
AUTHORIZE_ENDPOINT = f"{AUTHORITY}/oauth2/authorize"
TOKEN_ENDPOINT = f"{AUTHORITY}/oauth2/token"
DISCOVERY_ENDPOINT = f"{AUTHORITY}/.well-known/openid-configuration"

CLIENT_ID = _sanitize_client_id(os.getenv("TUURIO_CLIENT_ID")) or "php-KQD8"
CLIENT_SECRET = os.getenv("TUURIO_CLIENT_SECRET", "YOUR_CLIENT_SECRET")

REDIRECT_URI = _normalize_url(os.getenv("TUURIO_REDIRECT_URI")) or "http://localhost:8083/auth/callback"
POST_LOGOUT_REDIRECT_URI = (
    _normalize_url(os.getenv("TUURIO_POST_LOGOUT_REDIRECT_URI")) or "http://localhost:8083/"
)
SCOPE = _sanitize_scope(os.getenv("TUURIO_SCOPE")) or "openid profile email"

SECRET_KEY = os.getenv("TUURIO_SESSION_SECRET", "tuurio-auth-sample")
