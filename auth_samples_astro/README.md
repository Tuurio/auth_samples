# Astro OIDC authentication with Tuurio ID

Runnable Astro Node-server starter with Authorization Code + PKCE S256, validated ID tokens, UserInfo subject binding, opaque server-side sessions, a protected page, and RP-initiated logout.

## Configure

```bash
npx manage-tuurio-id@1.1.6 init --framework astro --project-dir . --auth browser --yes --output json --campaign github_astro --no-open --no-wait
npm install
npm run dev
```

The in-memory transaction/session stores are intentionally visible sample infrastructure. Replace them with a shared server-side store before horizontal scaling. Keep `TUURIO_CLIENT_SECRET` server-only.
