# Tuurio Auth PHP Server Demo

A server-rendered PHP demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

This version performs the authorization code exchange on the server and stores tokens in the PHP session.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:8080/
Post-logout Redirect URI: http://localhost:8080/
```

## Setup

From the repo root:

Export your Tuurio client secret (required for confidential clients):

```
export TUURIO_ID_SECRET=your-client-secret
```

```
php -S localhost:8080 -t auth_samples_php/public auth_samples_php/router.php
```

Open:

```
http://localhost:8080
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `8080`.
- This app accepts callbacks on `/` or `/auth/callback`; use the one you configured.

## What you will see

- A login screen with a “Continue with Tuurio ID” button.
- After you authenticate, you are redirected back to the app.
- The app shows:
  - Access token and ID token (raw + decoded claims).
  - Token expiry time and scope.
  - User profile JSON.
  - Logout button that ends the session and returns to the app.

## Configuration

Edit `src/config.php` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authority: https://test.id.tuurio.com
client_id: php-KQD8
redirect_uri: http://localhost:8080/
post_logout_redirect_uri: http://localhost:8080/
scope: openid profile email
```

The client secret is read from the `TUURIO_ID_SECRET` environment variable and sent
using `client_secret_basic` to the token endpoint.

## Notes

- Tokens are stored in the PHP session. Adjust session lifetime as needed.
- Token exchange happens server-side using cURL.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure the callback URL matches exactly.
- Check PHP logs for token exchange errors.

**No matching state found**
- Confirm the browser session is preserved between authorize and callback.
- Avoid using multiple tabs with different sessions.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:8080/` (or `/auth/callback` if you prefer) and save.
