# Tuurio Auth React Demo

A React + Vite demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local config:

```bash
cp .env.example .env
```

3. Update `.env` with your tenant values from:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:5173/auth/callback
Post-logout Redirect URI: http://localhost:5173/
```

The demo also accepts `/callback` for compatibility.

## `.env` keys

```env
VITE_TUURIO_ISSUER=https://test.id.tuurio.com
VITE_TUURIO_CLIENT_ID=spa-K53I
VITE_TUURIO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/
VITE_TUURIO_SCOPE=openid profile email
```

Notes:
- This is a public SPA client. Do not use or commit confidential client secrets.
- Keep redirect URIs and post-logout URIs exact.
