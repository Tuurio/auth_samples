# SvelteKit OIDC authentication with Tuurio ID

Runnable SvelteKit server starter with Authorization Code + PKCE S256, validated ID tokens, UserInfo subject binding, opaque server-side sessions, protected routes, and RP-initiated logout.

## Configure

```bash
npx manage-tuurio-id@1.1.6 init --framework sveltekit --project-dir . --auth browser --yes --output json --campaign github_sveltekit --no-open --no-wait
npm install
npm run dev
```

The in-memory transaction/session stores make the security boundaries visible. Replace them with a shared server-side store before running multiple instances. Never expose `TUURIO_CLIENT_SECRET` to browser code.
