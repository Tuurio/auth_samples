# React Router full-stack OIDC authentication with Tuurio ID

Runnable React Router + Vite + Express starter with one application origin, Authorization Code + PKCE S256, validated ID tokens, UserInfo subject binding, opaque server-side sessions, a protected API/route, and RP-initiated logout.

```bash
npx manage-tuurio-id@1.1.6 init --framework react-router --project-dir . --auth browser --yes --output json --campaign github_react_router --no-open --no-wait
npm install
npm run dev
```

The in-memory transaction/session stores are intentionally simple. Replace them with a shared server-side store before horizontal scaling. Never expose `TUURIO_CLIENT_SECRET` or tokens to the React bundle.
