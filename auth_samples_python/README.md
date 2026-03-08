# Tuurio Auth Python Demo

A server-rendered Flask demo that signs in with OAuth 2.0 / OpenID Connect, then displays token contents and a logout button.

## Setup

```bash
cd auth_samples_python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with your tenant/client values
python app.py
```

Open `http://localhost:8083`.

## Required client URLs

Configure your Tuurio client with these redirect URLs (matching your `.env` values):

```text
Redirect URI: http://localhost:8083/auth/callback
Post-logout Redirect URI: http://localhost:8083/logout/callback
```

## `.env` keys

```env
TUURIO_ISSUER=https://test.id.tuurio.com
TUURIO_CLIENT_ID=php-KQD8
TUURIO_CLIENT_SECRET=YOUR_CLIENT_SECRET
TUURIO_REDIRECT_URI=http://localhost:8083/auth/callback
TUURIO_POST_LOGOUT_REDIRECT_URI=http://localhost:8083/logout/callback
TUURIO_SCOPE=openid profile email
TUURIO_SESSION_SECRET=tuurio-auth-sample
```

Values come from your Tuurio **Connect** page:

```text
https://<tenantId>.id.tuurio.com/admin/clients
```
