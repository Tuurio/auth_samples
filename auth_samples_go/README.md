# Tuurio Auth Go Demo

A server-rendered Go demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

This version performs the authorization code exchange on the server and stores tokens in memory per session.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:8084/auth/callback
Post-logout Redirect URI: http://localhost:8084/
```

## Setup

From the repo root:

```
cd auth_samples_go
go run .
```

Open:

```
http://localhost:8084
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `8084`.
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

Edit `main.go` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authority: https://test.id.tuurio.com
client_id: php-KQD8
client_secret: YOUR_CLIENT_SECRET
redirect_uri: http://localhost:8084/auth/callback
post_logout_redirect_uri: http://localhost:8084/
scope: openid profile email
```

## Implemented snippet

The demo mirrors your provided x/oauth2 snippet in `main.go`:

- `oauth2.Config` with authorize/token endpoints.
- `/login` builds the authorization URL (with PKCE).
- `/auth/callback` exchanges the code for tokens.
- `/logout` uses discovery + `end_session_endpoint` for RP-initiated logout.
- UserInfo is fetched using the access token.

## Notes

- Tokens are stored in memory per session. Use a persistent store for production.
- Token exchange happens server-side using `golang.org/x/oauth2`.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure the callback URL matches exactly.
- Check server logs for token exchange errors.

**No matching state found**
- Confirm the browser session is preserved between authorize and callback.
- Avoid using multiple tabs with different sessions.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:8084/auth/callback` and save.
