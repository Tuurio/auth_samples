# Tuurio Auth Node.js Demo

A server-rendered Node.js demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Setup

```bash
cd auth_samples_node
npm install
cp .env.example .env
# edit .env with your tenant/client values
npm start
```

Open `http://localhost:8082`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:8082/auth/callback
Post-logout Redirect URI: http://localhost:8082/logout/callback
```

## `.env` keys

```env
TUURIO_ISSUER=https://test.id.tuurio.com
TUURIO_CLIENT_ID=spa-K53I
TUURIO_CLIENT_SECRET=
TUURIO_REDIRECT_URI=http://localhost:8082/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:8082/logout/callback
TUURIO_SCOPE=openid profile email
TUURIO_SESSION_SECRET=tuurio-auth-sample
TUURIO_SESSION_COOKIE_NAME=tuurio.sid
TUURIO_SESSION_TRUST_PROXY=false
TUURIO_SESSION_SECURE_COOKIE=false
TUURIO_SESSION_SAME_SITE=lax
TUURIO_SESSION_MAX_AGE_MS=28800000
```

Values come from your Tuurio **Connect** page:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```

Security notes:
- For production, set `TUURIO_SESSION_SECRET` to a strong value (at least 32 chars, not default).
- Behind reverse proxies, set `TUURIO_SESSION_TRUST_PROXY=true`.
- In production, set `TUURIO_SESSION_SECURE_COOKIE=true`.
