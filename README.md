# Tuurio Auth Samples

Sample integrations for [Tuurio ID](https://id.tuurio.com) across SPA, mobile, and server-side stacks.

This repository is the authoritative source for Tuurio's framework-specific GitHub templates. The generated satellite repositories are distribution surfaces; implementation fixes belong here first.

## Cursor and AI coding agents

This repository also publishes an installable Cursor rule at [`rules/tuurio-auth.mdc`](./rules/tuurio-auth.mdc). The rule is self-contained: it does not load mutable remote instructions, requires explicit approval before provisioning, and pins the reviewed `manage-tuurio-id` CLI version. Signup, approval, and secrets remain in a human-controlled browser handoff.

Ready-to-copy equivalents are available for [`AGENTS.md`](./agent-guides/AGENTS.md) and [`CLAUDE.md`](./agent-guides/CLAUDE.md). Their [usage notes](./agent-guides/README.md) explain how to add one reviewed guide to an application repository.

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
| Lovable | React + Vite + `oidc-client-ts` | [Lovable guide](https://id.tuurio.com/vibe/lovable) | [auth_samples_lovable](./auth_samples_lovable) |
| Vue 3 | Vite + Composition API | [Vue guide](https://id.tuurio.com/public/developers/examples/vue) | [auth_samples_vue3](./auth_samples_vue3) |
| Angular | Standalone Components | [Angular guide](https://id.tuurio.com/public/developers/examples/angular) | [auth_samples_angular](./auth_samples_angular) |
| Next.js | App Router + Auth.js | [Next.js guide](https://id.tuurio.com/public/developers/examples/nextjs) | [auth_samples_nextjs](./auth_samples_nextjs) |
| SvelteKit | SvelteKit + server hooks | [SvelteKit guide](https://id.tuurio.com/public/developers/examples/sveltekit) | [auth_samples_sveltekit](./auth_samples_sveltekit) |
| Nuxt | Nuxt + server routes | [Nuxt guide](https://id.tuurio.com/public/developers/examples/nuxt) | [auth_samples_nuxt](./auth_samples_nuxt) |
| Astro | Astro + server sessions | [Astro guide](https://id.tuurio.com/public/developers/examples/astro) | [auth_samples_astro](./auth_samples_astro) |
| React Router | React Router framework mode | [React Router guide](https://id.tuurio.com/public/developers/examples/react-router) | [auth_samples_react_router](./auth_samples_react_router) |

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
| Python | Django | [Django guide](https://id.tuurio.com/public/developers/examples/django) | [auth_samples_django](./auth_samples_django) |
| Python | FastAPI | [FastAPI guide](https://id.tuurio.com/public/developers/examples/fastapi) | [auth_samples_fastapi](./auth_samples_fastapi) |

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

## Template distribution

The reviewed catalog and target repository metadata live in [`distribution/templates.yml`](./distribution/templates.yml). It inventories 20 implemented framework templates. The distribution pipeline validates, packages, and synchronizes each source directory into a separately discoverable GitHub template repository without making the satellite an independent source of truth.

Validate the catalog with:

```bash
cd distribution
npm ci
npm run validate
```

Generated repositories must preserve their upstream-source notice, use normal synchronization commits, and never contain local environment files or credentials.

## Notes

- Sample environment values are placeholders. Replace them with values from your own Tuurio tenant.
- SPA and mobile samples are public clients and should not use confidential client secrets.
- Server-side samples show confidential-client setups where a client secret is expected.

## License

Licensed under the [Apache License, Version 2.0](./LICENSE).
