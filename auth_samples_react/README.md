# Tuurio Auth React Demo

A React + Vite demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:5173/auth/callback
Redirect URI: http://127.0.0.1:5173/auth/callback
Post-logout Redirect URI: http://localhost:5173/
Post-logout Redirect URI: http://127.0.0.1:5173/
```

## Setup

```
npm install
npm run dev
```

Open:

```
http://127.0.0.1:5173
```

You can also open `http://localhost:5173`, but redirect URIs must match exactly.

To pass runtime config at startup, append query params:

```
http://127.0.0.1:5173/?auth_server=https://trialdemo.id.localhost:8443&client_id=trial-react-spa&scope=openid%20profile%20email
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `5173`.
- Callback route is `/auth/callback`.

## What you will see

- A login screen with a “Continue with Tuurio ID” button.
- After you authenticate, you are redirected back to the app.
- The app shows:
  - Access token and ID token (raw + decoded claims).
  - Token expiry time and scope.
  - UserInfo JSON (user profile).
  - Logout button that ends the session and returns to the app.

## Configuration

This app supports runtime OIDC config:

- `auth_server` (alias: `server_url`) -> OIDC issuer origin
- `client_id` (alias: `clientId`) -> OAuth client ID
- `scope` -> space-separated scope string
- Example:
  - `http://127.0.0.1:5173/?auth_server=https://starterdemo.id.localhost:8443&client_id=starter-react-spa&scope=openid%20profile%20email`
- Behavior:
  - `auth_server` is normalized to origin form (`http(s)://host[:port]`).
  - `client_id` and `scope` are sanitized.
  - Runtime values are stored in `sessionStorage` and reused for callback/logout redirects.
  - If a value is missing, defaults from `src/auth.ts` are used.

Use the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

All relevant values (client ID, redirect/callback URL, post-logout URL, scopes) must match your
tenant’s client configuration.

The current sample values are:

```
authority: https://test.id.tuurio.com
client_id: spa-K53I
redirect_uri: http://localhost:5173/auth/callback
post_logout_redirect_uri: http://localhost:5173/
scope: openid profile email
```

When launched via Auth Control, these values are passed automatically from `/demo/seed` `spaClients`
for the selected tenant.

## Notes

- The app stores session state in `sessionStorage` to reduce persistence.
- The OAuth callback route is `/auth/callback`.

## Security considerations

- Runtime `auth_server`/`server_url` is a local-dev convenience. Do not accept untrusted authority URLs in production clients.
- Restrict allowed redirect URIs and post-logout URIs to exact expected origins/paths.
- This is a public SPA client: never add or commit confidential client secrets.
- Keep tenant/client test credentials out of source control.
- `sessionStorage` reduces persistence but is still browser-accessible data; use stricter controls for production-grade applications.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- In dev, React StrictMode can double-run the callback. This demo already guards against that.
- If you customized `AuthCallback`, ensure you only call `signinRedirectCallback()` once.

**No matching state found in storage after login**
- Make sure the origin you open matches the redirect URI exactly
  (no `127.0.0.1` vs `localhost`, no `https` vs `http`).
- If your IdP opens the callback in a new tab, `sessionStorage` won’t match.
  Switch to `localStorage` or keep the flow in the same tab.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:5173/auth/callback` and `http://127.0.0.1:5173/auth/callback`, then save.

**Tenant/Subdomain passt nicht zum Client / Redirect-URL stimmt nicht exakt / Scopes nicht freigegeben**
- `auth_server`, `client_id`, and `scope` do not match the selected tenant client configuration.
- Verify the startup URL query params or re-run seed in Auth Control and reopen client.
