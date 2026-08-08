from urllib.parse import urlencode

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET
from tuurio_starter.settings import validate_tuurio_config

from .oauth import oauth

@require_GET
def index(request):
    return render(request, "index.html", {"user": request.session.get("tuurio_user")})

@require_GET
def login(request):
    validate_tuurio_config()
    return oauth.tuurio.authorize_redirect(request, settings.TUURIO_REDIRECT_URI)

@require_GET
def callback(request):
    token = oauth.tuurio.authorize_access_token(request)
    claims = token.get("userinfo") or {}
    if not token.get("access_token") or not claims.get("sub"):
        return HttpResponse("Validated identity is missing.", status=400)
    metadata = oauth.tuurio.load_server_metadata()
    userinfo_endpoint = metadata.get("userinfo_endpoint")
    if not userinfo_endpoint:
        return HttpResponse("UserInfo endpoint is missing.", status=400)
    response = oauth.tuurio.get(userinfo_endpoint, token=token)
    response.raise_for_status()
    profile = response.json()
    if profile.get("sub") != claims["sub"]:
        return HttpResponse("UserInfo subject mismatch.", status=400)
    request.session.cycle_key()
    request.session["tuurio_user"] = {key: profile.get(key) for key in ("sub", "name", "email")}
    request.session["tuurio_id_token"] = token.get("id_token")
    request.session.set_expiry(min(int(token.get("expires_in", 3600)), 3600))
    return redirect("dashboard")

@require_GET
def dashboard(request):
    user = request.session.get("tuurio_user")
    if not user:
        return redirect("index")
    return render(request, "dashboard.html", {"user": user})

@require_GET
def logout(request):
    validate_tuurio_config()
    id_token = request.session.get("tuurio_id_token")
    metadata = oauth.tuurio.load_server_metadata()
    endpoint = metadata.get("end_session_endpoint")
    request.session.flush()
    if not endpoint:
        return redirect("index")
    params = {"post_logout_redirect_uri": settings.TUURIO_POST_LOGOUT_REDIRECT_URI}
    if id_token:
        params["id_token_hint"] = id_token
    return redirect(f"{endpoint}?{urlencode(params)}")

@require_GET
def logout_callback(request):
    request.session.flush()
    return redirect("index")
