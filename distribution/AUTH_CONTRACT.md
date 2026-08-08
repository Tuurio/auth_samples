# Authentication contract for server-side starters

The SvelteKit, Nuxt, Astro, React Router, Django, and FastAPI starters implement the same reviewed boundary:

- OpenID Connect Authorization Code with PKCE S256; PKCE is never disabled.
- A fresh, unpredictable state and transaction are bound to every login and accepted once.
- The established OIDC library validates the ID token (signature/JWKS, issuer, audience, time claims, and nonce when sent) before authenticated state is created.
- A successful UserInfo request must return the exact validated ID-token subject.
- The browser receives only `HttpOnly`, `SameSite=Lax` cookies; access, refresh, and ID tokens stay on the server.
- Sessions expire no later than the token lifetime and are deleted when expired. These starters do not silently renew or retry tokens.
- RP-initiated logout clears local state first and supplies an ID-token hint only from server-side storage.
- Issuers and production redirects use HTTPS. Cleartext is limited to explicit local development.
- Callback errors never log codes, tokens, cookies, environment contents, or secrets.

The Node examples use in-memory transaction/session maps to make the boundary easy to inspect. FastAPI uses an in-memory opaque-session map, while Django uses its database-backed session engine. Replace in-memory stores with Redis or another shared, atomic server-side store before horizontal scaling.

The templates contain placeholders only. Provision exact redirect URIs with the pinned Tuurio CLI and keep `TUURIO_CLIENT_SECRET` server-only. Browser-only applications remain public clients and never receive a client secret.
