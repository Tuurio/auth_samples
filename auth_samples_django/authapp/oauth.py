from authlib.integrations.django_client import OAuth
from django.conf import settings

oauth = OAuth()
oauth.register(
    name="tuurio",
    client_id=settings.TUURIO_CLIENT_ID,
    client_secret=settings.TUURIO_CLIENT_SECRET or None,
    server_metadata_url=f"{settings.TUURIO_ISSUER.rstrip('/')}/.well-known/openid-configuration" if settings.TUURIO_ISSUER else None,
    client_kwargs={"scope": settings.TUURIO_SCOPE, "code_challenge_method": "S256"},
)
