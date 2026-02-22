from __future__ import annotations

import base64
import json
import html
from datetime import datetime
from urllib.parse import urlencode

from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, request, session, url_for

import config

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

oauth = OAuth(app)
oauth.register(
    name="tuurio",
    client_id=config.CLIENT_ID,
    client_secret=config.CLIENT_SECRET,
    server_metadata_url=config.DISCOVERY_ENDPOINT,
    client_kwargs={"scope": config.SCOPE},
)


@app.route("/")
def index():
    token = session.get("token")
    error = session.pop("error", None)

    status = {"label": "Authenticated", "tone": "good"} if token else {"label": "Signed out", "tone": "neutral"}
    content = render_token_view(token) if token else render_login_view(error)
    return render_page(status, content)


@app.route("/login")
def login():
    redirect_uri = url_for("auth_callback", _external=True)
    return oauth.tuurio.authorize_redirect(redirect_uri)


@app.route("/auth/callback")
def auth_callback():
    try:
        token = oauth.tuurio.authorize_access_token()
        if not token or "access_token" not in token:
            raise RuntimeError("Missing access token.")
        session["token"] = token

        userinfo = None
        try:
            metadata = oauth.tuurio.load_server_metadata()
            userinfo_endpoint = metadata.get("userinfo_endpoint")
            if userinfo_endpoint:
                resp = oauth.tuurio.get(userinfo_endpoint, token=token)
                if resp.ok:
                    userinfo = resp.json()
        except Exception:  # pylint: disable=broad-except
            userinfo = None
        session["userinfo"] = userinfo
    except Exception as exc:  # pylint: disable=broad-except
        session["error"] = str(exc) or "Login failed."
    return redirect("/")


@app.route("/logout")
def logout():
    try:
        metadata = oauth.tuurio.load_server_metadata()
        end_session = metadata.get("end_session_endpoint")
        if not end_session:
            raise RuntimeError("End session endpoint not found.")

        id_token = session.get("token", {}).get("id_token")
        session.pop("token", None)
        session.pop("userinfo", None)

        params = {
            "client_id": config.CLIENT_ID,
            "post_logout_redirect_uri": config.POST_LOGOUT_REDIRECT_URI,
        }
        if id_token:
            params["id_token_hint"] = id_token

        return redirect(end_session + "?" + urlencode(params))
    except Exception as exc:  # pylint: disable=broad-except
        session["error"] = str(exc) or "Logout failed."
        return redirect("/")


@app.errorhandler(404)
def not_found(_):
    status = {"label": "Route not found", "tone": "neutral"}
    content = (
        "<section class=\"card\">"
        "<div class=\"stack\">"
        "<div class=\"status status-bad\">404</div>"
        "<h2 class=\"card-title\">This route doesn't exist.</h2>"
        "<p class=\"muted\">Return to the login page to start a new session.</p>"
        "<a class=\"button ghost\" href=\"/\">Go home</a>"
        "</div>"
        "</section>"
    )
    return render_page(status, content), 404


def render_page(status: dict, content: str) -> str:
    return (
        "<!doctype html>"
        "<html lang=\"en\">"
        "<head>"
        "<meta charset=\"utf-8\" />"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />"
        "<title>Tuurio Auth Python Demo</title>"
        "<link rel=\"stylesheet\" href=\"/static/assets/app.css\" />"
        "</head>"
        "<body>"
        f"<div id=\"app\">{render_shell(status, content)}</div>"
        "</body>"
        "</html>"
    )


def render_shell(status: dict, content: str) -> str:
    tone = html.escape(status.get("tone", "neutral"))
    label = html.escape(status.get("label", ""))

    return f"""
    <div class="app">
      <aside class="side-panel">
        <div class="brand">
          <div class="logo-mark">tu</div>
          <div>
            <p class="brand-name">Tuurio Auth Studio</p>
            <p class="brand-subtitle">OIDC playground for OAuth 2.1</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for secure sign-in.</h1>
          <p class="muted">
            A minimal Python server that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div class="status-row">
            <span class="status status-{tone}">{label}</span>
            <span class="muted">Authority: test.id.tuurio.com</span>
          </div>
        </div>
        <div class="side-list">
          <div>
            <span class="eyebrow">Architecture</span>
            <p>Authorization code flow + PKCE</p>
          </div>
          <div>
            <span class="eyebrow">Storage</span>
            <p>Server session storage</p>
          </div>
          <div>
            <span class="eyebrow">Scope</span>
            <p>openid profile email</p>
          </div>
        </div>
      </aside>
      <main class="main-panel">{content}</main>
    </div>
    """


def render_login_view(error: str | None) -> str:
    error_html = f"<div class=\"status status-bad\">{html.escape(error)}</div>" if error else ""

    return f"""
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">OAuth 2.1 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            This app uses the authorization code flow with PKCE to fetch tokens securely for a
            browser-based client.
          </p>
        </div>
        <div class="button-row">
          <a class="button primary" href="/login">Continue with Tuurio ID</a>
          <span class="helper">You'll be redirected to test.id.tuurio.com</span>
        </div>
        {error_html}
      </section>
      <section class="card card-soft">
        <div class="feature-grid">
          <div class="feature">
            <h3>PKCE by default</h3>
            <p class="muted">Proof Key for Code Exchange protects the code flow.</p>
          </div>
          <div class="feature">
            <h3>Short-lived tokens</h3>
            <p class="muted">Access tokens are scoped to openid profile email.</p>
          </div>
          <div class="feature">
            <h3>Session aware</h3>
            <p class="muted">Token state is persisted in server session storage.</p>
          </div>
        </div>
      </section>
    </div>
    """


def render_token_view(token: dict) -> str:
    access_token = token.get("access_token", "")
    id_token = token.get("id_token", "")
    scope_label = token.get("scope") or config.SCOPE
    expires_at = token.get("expires_at")
    if expires_at is None and token.get("expires_in"):
        expires_at = int(datetime.utcnow().timestamp()) + int(token.get("expires_in"))

    access_decoded = decode_jwt(access_token)
    id_decoded = decode_jwt(id_token)

    access_decoded_text = json.dumps(access_decoded, indent=2) if access_decoded else "Not a JWT or unable to decode."
    id_decoded_text = json.dumps(id_decoded, indent=2) if id_decoded else "Not a JWT or unable to decode."
    userinfo = session.get("userinfo")
    profile_json = json.dumps(userinfo, indent=2) if userinfo else "No profile data."

    access_panel = render_token_panel(
        "Access Token",
        access_token,
        access_decoded_text,
        "Used to call protected APIs.",
    )
    id_panel = render_token_panel(
        "ID Token",
        id_token,
        id_decoded_text,
        "Proves the authenticated user.",
    )

    return f"""
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">Session ready</span>
          <h2 class="card-title">You're signed in</h2>
          <p class="muted">Tokens expire at {format_time(expires_at)} and are scoped for {html.escape(scope_label)}.</p>
        </div>
        <div class="button-row">
          <a class="button ghost" href="/logout">Logout</a>
          <span class="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </section>

      <div class="token-grid">
        {access_panel}
        {id_panel}
      </div>

      <section class="card card-soft">
        <h3 class="section-title">User profile (UserInfo)</h3>
        <pre class="code-block">{html.escape(profile_json)}</pre>
      </section>
    </div>
    """


def render_token_panel(title: str, token: str, decoded: str, description: str) -> str:
    token_label = html.escape(token) if token else "Not provided"
    decoded_label = html.escape(decoded)
    return f"""
    <section class="card card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">{html.escape(title)}</h3>
          <p class="muted">{html.escape(description)}</p>
        </div>
      </div>
      <pre class="token-block">{token_label}</pre>
      <div class="token-claims">
        <span class="eyebrow">Decoded claims</span>
        <pre class="code-block">{decoded_label}</pre>
      </div>
    </section>
    """


def decode_jwt(token: str) -> dict | None:
    if not token:
        return None
    parts = token.split(".")
    if len(parts) < 2:
        return None
    try:
        payload = base64url_decode(parts[1])
        return json.loads(payload)
    except Exception:  # pylint: disable=broad-except
        return None


def base64url_decode(value: str) -> str:
    padding = '=' * (-len(value) % 4)
    data = base64.urlsafe_b64decode(value + padding)
    return data.decode('utf-8')


def format_time(unix_seconds: int | None) -> str:
    if not unix_seconds:
        return "unknown time"
    return datetime.fromtimestamp(int(unix_seconds)).strftime("%Y-%m-%d %H:%M:%S")


if __name__ == "__main__":
    app.run(port=8083, debug=True)
