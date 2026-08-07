# Tuurio Auth Java (Spring Boot) Demo

A server-rendered Spring Boot demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Integration guide

- Detailed integration guide: [Spring Boot example page](https://id.tuurio.com/public/developers/examples/spring-boot)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Setup

```bash
cd auth_samples_java
npx manage-tuurio-id@1.1.6 init --framework spring --project-dir . --auth browser --yes --output json --campaign github_spring_boot --no-open --no-wait
./gradlew bootRun
```

Open `http://localhost:8085`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:8085/auth/callback
Post-logout Redirect URI: http://localhost:8085/logout/callback
```

## `.env` keys

```env
TUURIO_ISSUER=https://your-tenant.id.tuurio.com
TUURIO_CLIENT_ID=replace-with-your-server-client-id
TUURIO_CLIENT_SECRET=replace-with-your-client-secret
TUURIO_REDIRECT_URI=http://localhost:8085/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:8085/logout/callback
TUURIO_SCOPE=openid,profile,email
```

Values come from your Tuurio **Connect** page:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```
