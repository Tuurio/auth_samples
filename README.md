# auth_samples

Sample clients for Tuurio Auth as a Service.

## Included demos

- `auth_samples_react` - React + Vite SPA
- `auth_samples_vue3` - Vue 3 + Vite SPA
- `auth_samples_angular` - Angular SPA (standalone components)
- `auth_samples_nextjs` - Next.js (App Router)
- `auth_samples_android` - Android (Jetpack Compose)
- `auth_samples_ios` - iOS (SwiftUI + AppAuth)
- `auth_samples_flutter` - Flutter (flutter_appauth)
- `auth_samples_php` - PHP (server-rendered, token exchange on backend)
- `auth_samples_node` - Node.js (server-rendered, token exchange on backend)
- `auth_samples_python` - Python (Flask, server-rendered)

Notes:
- The PHP sample performs the OAuth code exchange on the server and stores tokens in the PHP session. See `auth_samples_php/README.md`.
- The Node.js sample performs the OAuth code exchange on the server and stores tokens in memory. See `auth_samples_node/README.md`.
- The Python sample performs the OAuth code exchange on the server and stores tokens in the Flask session. See `auth_samples_python/README.md`.
- Web samples require redirect URI configuration (protocol/host/port/path must match).
- Mobile samples (Android/iOS/Flutter) require URL scheme configuration for redirect URIs. See each README for setup.
