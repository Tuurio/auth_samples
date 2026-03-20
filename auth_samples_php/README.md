# Tuurio Auth PHP Server Demo

A server-rendered PHP demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Integration guide

- Detailed integration guide: [PHP example page](https://id.tuurio.com/public/developers/examples/php)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Setup

```bash
cd auth_samples_php
cp .env.example .env
# edit .env with your tenant/client values
php -S localhost:8080 -t public router.php
```

Open `http://localhost:8080`.

For Apache/Plesk deployments, `public/` is still the preferred document root. If the whole package is web-accessible instead, the bundled root `.htaccess` forwards requests into `public/` and blocks direct access to internal files.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:8080/auth/callback
Post-logout Redirect URI: http://localhost:8080/logout/callback
```

## `.env` keys

```env
TUURIO_ISSUER=https://test.id.tuurio.com
TUURIO_CLIENT_ID=php-KQD8
TUURIO_CLIENT_SECRET=
TUURIO_REDIRECT_URI=http://localhost:8080/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:8080/logout/callback
TUURIO_SCOPE=openid profile email
```

Values come from your Tuurio **Connect** page:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```
