# Tuurio Auth Python Demo

A server-rendered Flask demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

This version performs the authorization code exchange on the server and stores tokens in the Flask session.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:8083/auth/callback
Post-logout Redirect URI: http://localhost:8083/
```

## Setup

From the repo root:

```
cd auth_samples_python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open:

```
http://localhost:8083
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `8083`.
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

Edit `config.py` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authority: https://test.id.tuurio.com
client_id: php-KQD8
client_secret: YOUR_CLIENT_SECRET
redirect_uri: http://localhost:8083/auth/callback
post_logout_redirect_uri: http://localhost:8083/
scope: openid profile email
```

## Implemented snippet

The demo mirrors your provided Authlib snippet in `app.py`:

- `OAuth(app)` + `oauth.register(...)`.
- `/login` uses `authorize_redirect`.
- `/auth/callback` exchanges the code for tokens.
- `/logout` uses discovery + `end_session_endpoint` for RP-initiated logout.

## Notes

- Tokens are stored in the Flask session. Use a production session store for real deployments.
- Token exchange happens server-side via Authlib.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure the callback URL matches exactly.
- Check server logs for token exchange errors.

**No matching state found**
- Confirm the browser session is preserved between authorize and callback.
- Avoid using multiple tabs with different sessions.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:8083/auth/callback` and save.
