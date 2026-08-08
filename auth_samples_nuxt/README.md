# Nuxt OIDC authentication with Tuurio ID

Nuxt server starter with Authorization Code + PKCE S256, validated ID tokens and UserInfo subject binding, opaque server sessions, protected pages, and RP-initiated logout.

```bash
npx manage-tuurio-id@1.1.6 init --framework nuxt --project-dir . --auth browser --yes --output json --campaign github_nuxt --no-open --no-wait
npm install
npm run dev
```

Replace the in-memory session and transaction stores with a shared server-side store before horizontal scaling. Client secrets and tokens never enter Vue client code.
