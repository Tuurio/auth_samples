# Tuurio Auth Samples

Sample integrations for [Tuurio ID](https://id.tuurio.com) across SPA, mobile, and server-side stacks.

## Docs

Detailed integration guidance now lives on `id.tuurio.com`. This GitHub repository remains the code host for the runnable examples.

- General developer docs: [https://id.tuurio.com/public/developers](https://id.tuurio.com/public/developers)
- Sample-specific guides: use the example pages linked in the tables below
- Platform overview: [Features](https://id.tuurio.com/public/features)
- Managed profile and master-data context: [Vault](https://id.tuurio.com/public/vault)
- Security guidance: [Security](https://id.tuurio.com/public/security)

## Included Samples

The samples in this repository show practical Tuurio ID client integrations for public and confidential applications. Web samples use the Authorization Code flow, with PKCE where appropriate for public clients.

### Web SPAs

| Framework | Tech Stack | Guide | Code |
| :--- | :--- | :--- | :--- |
| React | Vite + `oidc-client-ts` | [React guide](https://id.tuurio.com/public/developers/examples/react) | [auth_samples_react](./auth_samples_react) |
| Vue 3 | Vite + Composition API | [Vue guide](https://id.tuurio.com/public/developers/examples/vue) | [auth_samples_vue3](./auth_samples_vue3) |
| Angular | Standalone Components | [Angular guide](https://id.tuurio.com/public/developers/examples/angular) | [auth_samples_angular](./auth_samples_angular) |
| Next.js | App Router + Auth.js | [Next.js guide](https://id.tuurio.com/public/developers/examples/nextjs) | [auth_samples_nextjs](./auth_samples_nextjs) |

### Mobile and Native

| Platform | Tech Stack | Guide | Code |
| :--- | :--- | :--- | :--- |
| Android | Jetpack Compose | [Android guide](https://id.tuurio.com/public/developers/examples/android) | [auth_samples_android](./auth_samples_android) |
| iOS | SwiftUI + AppAuth | [iOS guide](https://id.tuurio.com/public/developers/examples/ios) | [auth_samples_ios](./auth_samples_ios) |
| Flutter | `flutter_appauth` | [Flutter guide](https://id.tuurio.com/public/developers/examples/flutter) | [auth_samples_flutter](./auth_samples_flutter) |

### Server-Side Applications

| Language | Framework | Guide | Code |
| :--- | :--- | :--- | :--- |
| Node.js | Express | [Node.js guide](https://id.tuurio.com/public/developers/examples/node) | [auth_samples_node](./auth_samples_node) |
| Python | Flask | [Python guide](https://id.tuurio.com/public/developers/examples/python) | [auth_samples_python](./auth_samples_python) |
| Go | `net/http` | [Go guide](https://id.tuurio.com/public/developers/examples/go) | [auth_samples_go](./auth_samples_go) |
| Java | Spring Boot 3 | [Spring Boot guide](https://id.tuurio.com/public/developers/examples/spring-boot) | [auth_samples_java](./auth_samples_java) |
| PHP | Vanilla PHP | [PHP guide](https://id.tuurio.com/public/developers/examples/php) | [auth_samples_php](./auth_samples_php) |
| Laravel | Laravel 12 | [Laravel guide](https://id.tuurio.com/public/developers/examples/laravel) | [auth_samples_laravel](./auth_samples_laravel) |

## Getting Started

1. Create a tenant and application in Tuurio ID.
2. Open the matching example page on `id.tuurio.com` for integration context and client setup.
3. Clone this repository and open the sample folder for your stack.
4. Copy the sample environment file and fill in your tenant-specific values.
5. Register the exact redirect and post-logout redirect URIs shown in that sample.
6. Run the sample locally.

Example:

```bash
git clone https://github.com/Tuurio/auth_samples.git
cd auth_samples/auth_samples_react
cp .env.example .env
# edit .env with your issuer/client/redirect values
npm install
npm run dev
```

## Notes

- Sample environment values are placeholders. Replace them with values from your own Tuurio tenant.
- SPA and mobile samples are public clients and should not use confidential client secrets.
- Server-side samples show confidential-client setups where a client secret is expected.
