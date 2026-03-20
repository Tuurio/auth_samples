# Tuurio Auth Laravel Demo

A server-rendered Laravel sample that signs in with OIDC, stores tokens in the Laravel session, renders decoded claims, supports RP-initiated logout, and exposes a webhook endpoint with API key header validation.

## Integration guide

- Detailed integration guide: [Laravel example page](https://id.tuurio.com/public/developers/examples/laravel)
- General developer docs: [Tuurio ID developers](https://id.tuurio.com/public/developers)

## Setup

```bash
cd auth_samples_laravel
cp .env.example .env
composer install
php artisan key:generate
php artisan serve --host=127.0.0.1 --port=8000
```

Open `http://localhost:8000`.

No Node.js or Vite build step is required.

## Required client URLs

Configure your Tuurio client with these redirect URLs:

```text
Redirect URI: http://localhost:8000/auth/callback
Post-logout Redirect URI: http://localhost:8000/logout/callback
```

## `.env` keys

```env
TUURIO_ISSUER=https://<tenantId>.id.tuurio.com
TUURIO_CLIENT_ID=laravel-demo
TUURIO_CLIENT_SECRET=YOUR_CLIENT_SECRET
TUURIO_REDIRECT_URI=http://localhost:8000/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:8000/logout/callback
TUURIO_SCOPE=openid profile email
TUURIO_WEBHOOK_ID=
TUURIO_WEBHOOK_URL=
TUURIO_WEBHOOK_EDIT_URL=
TUURIO_WEBHOOK_SIGNING_SECRET=
TUURIO_WEBHOOK_LISTEN_PATH=/webhooks/tuurio
TUURIO_WEBHOOK_API_KEY_HEADER=X-Tuurio-Webhook-Key
TUURIO_WEBHOOK_API_KEY=
```

## What is included

- `/login` starts Authorization Code + PKCE
- `/auth/callback` exchanges the code and stores tokens in the Laravel session
- `/logout` calls the provider logout endpoint with `client_id + post_logout_redirect_uri`
- `/logout/callback` confirms the local session is gone
- `POST /webhooks/tuurio` validates the configured API key header and logs incoming events

## Webhook notes

- Incoming webhook payloads are logged to `storage/logs/laravel.log`
- The sample validates the configured API key header before accepting the event
- If provisioning generated a live webhook for you, the `.env` already contains the endpoint metadata

## Webhook deployment notes

- If your deployed app already has a stable public URL, set `TUURIO_WEBHOOK_URL` to that final endpoint and keep `TUURIO_WEBHOOK_LISTEN_PATH` aligned with your Laravel route.
- If you provisioned the sample before deployment and only had a placeholder domain, update the webhook endpoint in the Tuurio admin after the final URL is known.
- Keep `TUURIO_WEBHOOK_EDIT_URL` if provisioning filled it in. It points back to the webhook configuration you may need to adjust later.
- Do not expose the webhook route without checking the configured API key header. This sample expects `TUURIO_WEBHOOK_API_KEY_HEADER` and `TUURIO_WEBHOOK_API_KEY` to be set consistently with the tenant webhook configuration.
