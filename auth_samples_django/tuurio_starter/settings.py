import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("TUURIO_SESSION_SECRET", "development-only-change-before-deploy")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",") if host.strip()]
ROOT_URLCONF = "tuurio_starter.urls"
WSGI_APPLICATION = "tuurio_starter.wsgi.application"
INSTALLED_APPS = ["django.contrib.contenttypes", "django.contrib.sessions", "django.contrib.staticfiles", "authapp"]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
]
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [BASE_DIR / "templates"], "APP_DIRS": True, "OPTIONS": {"context_processors": ["django.template.context_processors.request"]}}]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

TUURIO_ISSUER = os.getenv("TUURIO_ISSUER", "").strip()
TUURIO_CLIENT_ID = os.getenv("TUURIO_CLIENT_ID", "").strip()
TUURIO_CLIENT_SECRET = os.getenv("TUURIO_CLIENT_SECRET", "").strip()
TUURIO_REDIRECT_URI = os.getenv("TUURIO_REDIRECT_URI", "http://localhost:8000/auth/callback").strip()
TUURIO_POST_LOGOUT_REDIRECT_URI = os.getenv("TUURIO_POST_LOGOUT_REDIRECT_URI", "http://localhost:8000/logout/callback").strip()
TUURIO_SCOPE = os.getenv("TUURIO_SCOPE", "openid profile email").strip()

def validate_tuurio_config():
    if not TUURIO_ISSUER or "YOUR_" in TUURIO_ISSUER or not TUURIO_CLIENT_ID or TUURIO_CLIENT_ID.startswith("YOUR_"):
        raise RuntimeError("TUURIO_ISSUER and TUURIO_CLIENT_ID must be configured.")
    issuer = urlparse(TUURIO_ISSUER)
    issuer_loopback = issuer.hostname in {"localhost", "127.0.0.1", "::1"}
    if issuer.scheme != "https" and not (issuer.scheme == "http" and issuer_loopback):
        raise RuntimeError("TUURIO_ISSUER must use HTTPS outside an explicit loopback host.")
    for name, value in (("TUURIO_REDIRECT_URI", TUURIO_REDIRECT_URI), ("TUURIO_POST_LOGOUT_REDIRECT_URI", TUURIO_POST_LOGOUT_REDIRECT_URI)):
        parsed = urlparse(value)
        loopback = parsed.hostname in {"localhost", "127.0.0.1", "::1"}
        if parsed.scheme != "https" and not (parsed.scheme == "http" and loopback):
            raise RuntimeError(f"{name} must use HTTPS outside an explicit loopback host.")
