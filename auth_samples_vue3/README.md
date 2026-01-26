# Tuurio Auth Vue Demo

A Vue 3 + Vite demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:5173/auth/callback
Post-logout Redirect URI: http://localhost:5173/
```

## Setup

```
npm install
npm run dev
```

Open:

```
http://localhost:5173
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
  - User profile JSON.
  - Logout button that ends the session and returns to the app.

## Configuration

Edit `src/auth.ts` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

All relevant values (client ID, redirect/callback URL, post-logout URL, scopes) must be copied from your
tenant’s client configuration. **This demo uses sample values**, so replace them with your tenant’s settings.

The current sample values are:

```
authority: https://test.id.tuurio.com
client_id: spa-K53I
redirect_uri: http://localhost:5173/auth/callback
post_logout_redirect_uri: http://localhost:5173/
scope: openid profile email
```

## Notes

- The app stores session state in `sessionStorage` to reduce persistence.
- The OAuth callback route is `/auth/callback`.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure you only call `signinRedirectCallback()` once per callback. This demo handles this in `src/views/AuthCallback.vue`.

**No matching state found in storage after login**
- Make sure the origin you open matches the redirect URI exactly
  (no `127.0.0.1` vs `localhost`, no `https` vs `http`).
- If your IdP opens the callback in a new tab, `sessionStorage` won’t match.
  Switch to `localStorage` or keep the flow in the same tab.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:5173/auth/callback` and save.
