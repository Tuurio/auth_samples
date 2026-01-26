# Tuurio Auth Java (Spring Boot) Demo

A server-rendered Spring Boot demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

This version performs the authorization code exchange on the server and stores tokens in the HTTP session.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The client configuration snippet copied from the dashboard.

Make sure the client has these URLs configured:

```
Redirect URI: http://localhost:8085/auth/callback
Post-logout Redirect URI: http://localhost:8085/
```

## Setup

From the repo root:

```
cd auth_samples_java
./gradlew bootRun
```

If you don't have the Gradle wrapper, install Gradle and run:

```
gradle bootRun
```

Open:

```
http://localhost:8085
```

## Redirect URL checklist

- Redirect URI must match exactly (protocol, host, port, path).
- Dev server port is `8085`.
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

Edit `src/main/resources/application.yml` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
issuer-uri: https://test.id.tuurio.com
client-id: php-KQD8
client-secret: YOUR_CLIENT_SECRET
redirect-uri: http://localhost:8085/auth/callback
post-logout redirect: http://localhost:8085/
scope: openid profile email
```

## Implemented snippet

The demo mirrors your provided x/oauth2 snippet using Spring Security OAuth2 Client + Thymeleaf:

- `/login` redirects to the authorization endpoint.
- `/auth/callback` handles the authorization response.
- `/logout` uses RP-initiated logout from OIDC discovery.
- UserInfo is fetched via the OIDC user info endpoint.

## Notes

- Tokens are stored in the HTTP session. Use a persistent session store for production.
- CSRF is disabled for simplicity in this demo.

## Troubleshooting

**Login hangs on “Completing sign-in”**
- Ensure the callback URL matches exactly.
- Check server logs for token exchange errors.

**No matching state found**
- Confirm the browser session is preserved between authorize and callback.
- Avoid using multiple tabs with different sessions.

**Server error: redirectUris cannot be empty**
- Your client registration in the IdP has an empty redirect URIs list.
  Add `http://localhost:8085/auth/callback` and save.
