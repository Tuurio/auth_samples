# Tuurio ID Lovable / React sample

A React + Vite reference implementation for adding Tuurio ID to a Lovable app with OAuth 2.0 / OpenID Connect Authorization Code flow and PKCE.

## Integration guide

- Lovable guide and copy-paste prompt: [Tuurio ID for Lovable](https://id.tuurio.com/vibe/lovable)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Use with Lovable

Paste this prompt into your Lovable project:

```text
Add EU-hosted Tuurio ID login to this React/Vite app using OIDC Authorization Code with PKCE.

First identify both exact HTTPS origins:
- `LOVABLE_DEPLOYMENT_ORIGIN`: the stable standalone preview, published app, or custom-domain origin users can open outside the editor. This is the primary deployment target.
- `LOVABLE_EDITOR_PREVIEW_ORIGIN`: the embedded editor preview origin, normally `https://<project-id>.lovableproject.com`.

Never use Lovable's internal dev-server URL or localhost as the deployment origin. If the stable origin is not available yet, stop and ask me to publish the app or provide it.

After replacing both placeholders, run this non-interactive setup command exactly:
npx manage-tuurio-id@1.1.6 init --framework react --project-dir . --base-url LOVABLE_DEPLOYMENT_ORIGIN --redirect-uri LOVABLE_DEPLOYMENT_ORIGIN/auth/callback --post-logout-redirect-uri LOVABLE_DEPLOYMENT_ORIGIN/logout/callback --additional-origin LOVABLE_EDITOR_PREVIEW_ORIGIN --public-config src/tuurio.public.json --auth browser --yes --output json --campaign lovable_starter --no-open --no-wait

Run the approved command once. Show me `verificationUriComplete` from its `authorization_required` JSON result. After I complete the browser handoff, rerun the exact same command unchanged until it returns `configured`. Never overlap runs, delete saved handoff state, or add `--fresh-handoff` automatically. Then use auth_samples_lovable in https://github.com/Tuurio/auth_samples as the implementation reference. Import the generated `src/tuurio.public.json`, select only the target whose exact `deploymentBaseUrl` origin equals `window.location.origin`, and fail closed if none or more than one matches. Add sign-in, /auth/callback, authenticated state, sign-out, and /logout/callback. Never create, request, or expose a client secret. Never deploy `.env.local`.
```

Lovable currently creates projects inside Lovable and can export them to GitHub. This sample is a reference implementation for the agent; it is not intended to be imported into Lovable as an existing repository.

## Run locally

Requires Node.js 20.19 or newer.

1. Install dependencies:

```bash
npm install
```

2. For a local-only test, provision a public Tuurio ID client and replace the checked-in placeholder config:

```bash
npx manage-tuurio-id@1.1.6 init \
  --framework react \
  --project-dir . \
  --base-url http://localhost:5173 \
  --public-config src/tuurio.public.json \
  --overwrite-public-config \
  --auth browser \
  --yes \
  --output json \
  --campaign lovable_starter \
  --no-open \
  --no-wait
```

3. Complete the browser handoff, rerun the exact same command until it returns `configured`, then start the app:

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

## Deployable public-client configuration

`src/tuurio.public.json` contains the issuer, public client ID, scope, and every exact deployment/preview target. It is deliberately safe to commit and deploy. Runtime selection is based on an exact `window.location.origin` match; there is no wildcard or fallback to another target.

This is a public SPA client. Never add a client secret to browser code, configuration, a prompt, or a commit. Keep redirect URIs exact and use HTTPS outside local development. `.env.local` remains local-only and must never be deployed as an alternative production configuration.
