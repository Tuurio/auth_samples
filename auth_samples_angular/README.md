# Tuurio Auth Angular Demo

An Angular demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Integration guide

- Detailed integration guide: [Angular example page](https://id.tuurio.com/public/developers/examples/angular)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

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
npm start
```

Open `http://localhost:4200`.

`npm start` and `npm run build` automatically generate `src/app/auth/auth.config.generated.ts` from `.env`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:4200/auth/callback
Post-logout Redirect URI: http://localhost:4200/logout/callback
```

The demo also accepts `/callback` for compatibility.

## `.env` keys

```env
TUURIO_ISSUER=https://test.id.tuurio.com
TUURIO_CLIENT_ID=spa-K53I
TUURIO_REDIRECT_URI=http://localhost:4200/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:4200/logout/callback
TUURIO_SCOPE=openid profile email
```

Notes:
- This is a public SPA client. Do not use or commit confidential client secrets.
- Keep redirect URIs and post-logout URIs exact.
