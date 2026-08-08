# Django OIDC authentication with Tuurio ID

Django starter using Authlib, Authorization Code + PKCE S256, framework-managed state/nonce and ID-token validation, an explicit UserInfo subject check, database-backed sessions, protected views, and RP-initiated logout.

```bash
npx manage-tuurio-id@1.1.6 init --framework django --project-dir . --auth browser --yes --output json --campaign github_django --no-open --no-wait
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Set a strong `TUURIO_SESSION_SECRET` and `DEBUG=false` in production so Django emits Secure session cookies. The default SQLite-backed Django session keeps tokens server-side; use a shared database/cache session backend when horizontally scaling.
