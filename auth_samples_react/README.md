# Tuurio Auth React Demo

A React + Vite demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Integration guide

- Detailed integration guide: [React example page](https://id.tuurio.com/public/developers/examples/react)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Provision a tenant-specific public client through the human-approved browser handoff:

```bash
npx manage-tuurio-id@1.1.6 init --framework react --project-dir . --auth browser --yes --output json --campaign github_react_vite --no-open --no-wait
```

3. Start the development server after the CLI writes the ignored local configuration:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:5173/auth/callback
Post-logout Redirect URI: http://localhost:5173/logout/callback
```

The demo also accepts `/callback` for compatibility.

## `.env` keys

```env
VITE_TUURIO_ISSUER=https://your-tenant.id.tuurio.com
VITE_TUURIO_CLIENT_ID=replace-with-your-public-client-id
VITE_TUURIO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/logout/callback
VITE_TUURIO_SCOPE=openid profile email
```

Notes:
- This is a public SPA client. Do not use or commit confidential client secrets.
- Keep redirect URIs and post-logout URIs exact.
