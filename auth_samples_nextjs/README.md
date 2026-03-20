# Tuurio Auth Next.js Demo

A Next.js demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Integration guide

- Detailed integration guide: [Next.js example page](https://id.tuurio.com/public/developers/examples/nextjs)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local config:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your tenant values from:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env.local` values):

```text
Redirect URI: http://localhost:3000/auth/callback
Post-logout Redirect URI: http://localhost:3000/logout/callback
```

## `.env.local` keys

```env
NEXT_PUBLIC_TUURIO_ISSUER=https://test.id.tuurio.com
NEXT_PUBLIC_TUURIO_CLIENT_ID=spa-K53I
NEXT_PUBLIC_TUURIO_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/logout/callback
NEXT_PUBLIC_TUURIO_SCOPE=openid profile email
```

## Deployment notes

- Register the exact production callback URLs before deploying. Preview URLs and production URLs usually need separate client entries or separate redirect URIs.
- `NEXT_PUBLIC_*` variables are exposed to the browser bundle. Do not place confidential client secrets in this sample.
- If you deploy behind a platform URL and a custom domain, decide which host should own the login callback and register only the hosts you actually use.
- Keep `NEXT_PUBLIC_TUURIO_ISSUER` tenant-specific, for example `https://<tenantId>.id.tuurio.com`.
- After changing environment variables in your deployment platform, trigger a fresh build. Next.js will not pick up changed public env vars from an old build artifact.

Notes:
- This is a public SPA client. Do not use or commit confidential client secrets.
- Keep redirect URIs and post-logout URIs exact.
