# Tuurio ID Lovable / React sample

A React + Vite reference implementation for adding Tuurio ID to a Lovable app with OAuth 2.0 / OpenID Connect Authorization Code flow and PKCE.

## Integration guide

- Lovable guide and copy-paste prompt: [Tuurio ID for Lovable](https://id.tuurio.com/vibe/lovable)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Use with Lovable

Paste this prompt into your Lovable project:

```text
Add EU-hosted Tuurio ID login to this React/Vite app using OIDC Authorization Code with PKCE.

Run this non-interactive setup command:
npx manage-tuurio-id@1.1.1 init --framework react --project-dir . --base-url http://localhost:5173 --auth browser --yes --output json --campaign lovable_starter --no-open

Show me the browser verification URL and wait for approval. Then use auth_samples_lovable in https://github.com/Tuurio/auth_samples as the implementation reference. Add sign-in, /auth/callback, authenticated state, sign-out, and /logout/callback. Never create, request, or expose a client secret in browser code or VITE_ variables.
```

Lovable currently creates projects inside Lovable and can export them to GitHub. This sample is a reference implementation for the agent; it is not intended to be imported into Lovable as an existing repository.

## Run locally

Requires Node.js 20.19 or newer.

1. Install dependencies:

```bash
npm install
```

2. Provision a public Tuurio ID client and write `.env.local`:

```bash
npx manage-tuurio-id@1.1.1 init \
  --framework react \
  --project-dir . \
  --base-url http://localhost:5173 \
  --auth browser \
  --yes \
  --output json \
  --campaign lovable_starter
```

3. Complete the browser handoff, then start the app:

```bash
npm run typecheck
npm run dev
```

Open `http://localhost:5173` and verify sign-in, callback handling, authenticated state, and sign-out.

## Required client URLs

```text
Redirect URI: http://localhost:5173/auth/callback
Post-logout Redirect URI: http://localhost:5173/logout/callback
```

## `.env.local` keys

```env
VITE_TUURIO_ISSUER=https://your-tenant.id.tuurio.com
VITE_TUURIO_CLIENT_ID=replace-after-browser-handoff
VITE_TUURIO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/logout/callback
VITE_TUURIO_SCOPE=openid profile email
```

This is a public SPA client. Never add a client secret to browser code, a `VITE_` variable, a prompt, or a commit. Keep redirect URIs exact and use HTTPS outside local development.
