# Tuurio Auth Node.js Demo

A server-rendered Node.js demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

This version performs the authorization code exchange on the server and stores tokens in memory per session.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:8082/auth/callback
Post-logout Redirect URI: http://localhost:8082/
```

## Setup

From the repo root:

```
cd auth_samples_node
npm install
npm start
```

Open:

```
http://localhost:8082
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `8082`.
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

Edit `src/config.js` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authority: https://test.id.tuurio.com
clientId: spa-K53I
redirectUri: http://localhost:8082/auth/callback
postLogoutRedirectUri: http://localhost:8082/
scope: openid profile email
```

## Notes

- Tokens are stored in memory via `express-session`. Use a real session store for production.
- Token exchange happens server-side using `fetch` (Node 18+).

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure the callback URL matches exactly.
- Check server logs for token exchange errors.

**No matching state found**
- Confirm the browser session is preserved between authorize and callback.
- Avoid using multiple tabs with different sessions.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:8082/auth/callback` and save.
