# FastAPI OIDC authentication with Tuurio ID

Async FastAPI starter using Authlib, Authorization Code + PKCE S256, framework-managed state/nonce and ID-token validation, an explicit UserInfo subject check, opaque server-side sessions, a protected route, and RP-initiated logout.

```bash
npx manage-tuurio-id@1.1.6 init --framework fastapi --project-dir . --auth browser --yes --output json --campaign github_fastapi --no-open --no-wait
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set a strong `TUURIO_SESSION_SECRET` and `TUURIO_COOKIE_SECURE=true` in production. Replace the in-memory opaque-session store with Redis or another shared server-side store before horizontal scaling. Tokens never enter the browser cookie.
