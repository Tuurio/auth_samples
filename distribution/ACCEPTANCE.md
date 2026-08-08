# Template distribution acceptance

This document is the release record for the initial Tuurio starter catalog. It separates reproducible automated evidence from the human-approved browser step required by real tenant provisioning.

## Accepted release

- Source repository: [`Tuurio/auth_samples`](https://github.com/Tuurio/auth_samples)
- Source commit: [`7e52e3bf428164ad36fd550011263ac9d6848761`](https://github.com/Tuurio/auth_samples/commit/7e52e3bf428164ad36fd550011263ac9d6848761)
- License: Apache-2.0
- Catalog: 20 framework templates plus the Tuurio AI SaaS Starter
- Full-catalog synchronization: [successful run 31259377755](https://github.com/Tuurio/auth_samples/actions/runs/31259377755)
- Remote checksum and metadata verification: [successful run 31259497024](https://github.com/Tuurio/auth_samples/actions/runs/31259497024)

At this source commit every target below was independently checked as public, configured as a GitHub template repository, on `main`, and green on its generated validation workflow.

| Template | Repository | Validation |
| --- | --- | --- |
| React + Vite | [`react-vite-oidc-starter`](https://github.com/Tuurio/react-vite-oidc-starter) | [passed](https://github.com/Tuurio/react-vite-oidc-starter/actions/runs/31259403753) |
| Lovable | [`lovable-auth-starter`](https://github.com/Tuurio/lovable-auth-starter) | [passed](https://github.com/Tuurio/lovable-auth-starter/actions/runs/31259401029) |
| Vue 3 | [`vue-oidc-auth-starter`](https://github.com/Tuurio/vue-oidc-auth-starter) | [passed](https://github.com/Tuurio/vue-oidc-auth-starter/actions/runs/31259396675) |
| Angular | [`angular-oidc-auth-starter`](https://github.com/Tuurio/angular-oidc-auth-starter) | [passed](https://github.com/Tuurio/angular-oidc-auth-starter/actions/runs/31259402101) |
| Next.js | [`nextjs-auth-starter`](https://github.com/Tuurio/nextjs-auth-starter) | [passed](https://github.com/Tuurio/nextjs-auth-starter/actions/runs/31259405436) |
| Android | [`android-oidc-auth-starter`](https://github.com/Tuurio/android-oidc-auth-starter) | [passed](https://github.com/Tuurio/android-oidc-auth-starter/actions/runs/31259411406) |
| iOS | [`ios-oidc-auth-starter`](https://github.com/Tuurio/ios-oidc-auth-starter) | [passed](https://github.com/Tuurio/ios-oidc-auth-starter/actions/runs/31259410248) |
| Flutter | [`flutter-oidc-auth-starter`](https://github.com/Tuurio/flutter-oidc-auth-starter) | [passed](https://github.com/Tuurio/flutter-oidc-auth-starter/actions/runs/31259412453) |
| Express | [`express-oidc-auth-starter`](https://github.com/Tuurio/express-oidc-auth-starter) | [passed](https://github.com/Tuurio/express-oidc-auth-starter/actions/runs/31259418027) |
| Flask | [`flask-oidc-auth-starter`](https://github.com/Tuurio/flask-oidc-auth-starter) | [passed](https://github.com/Tuurio/flask-oidc-auth-starter/actions/runs/31259420662) |
| Go | [`go-oidc-auth-starter`](https://github.com/Tuurio/go-oidc-auth-starter) | [passed](https://github.com/Tuurio/go-oidc-auth-starter/actions/runs/31259420958) |
| Spring Boot | [`spring-boot-oidc-starter`](https://github.com/Tuurio/spring-boot-oidc-starter) | [passed](https://github.com/Tuurio/spring-boot-oidc-starter/actions/runs/31259425184) |
| PHP | [`php-oidc-auth-starter`](https://github.com/Tuurio/php-oidc-auth-starter) | [passed](https://github.com/Tuurio/php-oidc-auth-starter/actions/runs/31259428836) |
| Laravel | [`laravel-oidc-auth-starter`](https://github.com/Tuurio/laravel-oidc-auth-starter) | [passed](https://github.com/Tuurio/laravel-oidc-auth-starter/actions/runs/31259428805) |
| SvelteKit | [`sveltekit-oidc-auth-starter`](https://github.com/Tuurio/sveltekit-oidc-auth-starter) | [passed](https://github.com/Tuurio/sveltekit-oidc-auth-starter/actions/runs/31259428399) |
| Nuxt | [`nuxt-oidc-auth-starter`](https://github.com/Tuurio/nuxt-oidc-auth-starter) | [passed](https://github.com/Tuurio/nuxt-oidc-auth-starter/actions/runs/31259436749) |
| Astro | [`astro-oidc-auth-starter`](https://github.com/Tuurio/astro-oidc-auth-starter) | [passed](https://github.com/Tuurio/astro-oidc-auth-starter/actions/runs/31259435240) |
| React Router | [`react-router-auth-starter`](https://github.com/Tuurio/react-router-auth-starter) | [passed](https://github.com/Tuurio/react-router-auth-starter/actions/runs/31259440421) |
| Django | [`django-oidc-auth-starter`](https://github.com/Tuurio/django-oidc-auth-starter) | [passed](https://github.com/Tuurio/django-oidc-auth-starter/actions/runs/31259437913) |
| FastAPI | [`fastapi-oidc-auth-starter`](https://github.com/Tuurio/fastapi-oidc-auth-starter) | [passed](https://github.com/Tuurio/fastapi-oidc-auth-starter/actions/runs/31259441468) |
| AI SaaS | [`ai-saas-starter`](https://github.com/Tuurio/ai-saas-starter) | [passed](https://github.com/Tuurio/ai-saas-starter/actions/runs/31259444596) |

## Clean-room acceptance

The catalog was packaged from the source manifest into clean output directories and every declared `verify` command was run with the manifest's pinned runtime. This covers dependency installation from lockfiles, lint or static analysis where supplied, framework builds, unit tests, and the AI SaaS Playwright suite.

Reproduce the distribution checks from a clean checkout:

```bash
cd distribution
npm ci
npm run previews
npm run validate
npm run verify:remotes
```

The generated repository workflows repeat the framework-specific commands from `templates.yml`. Native targets are compiled or statically checked on their required platform; they are not presented as browser-previewable templates.

## Live authentication acceptance

Real provisioning deliberately contains a human boundary. The agent may create a handoff and wait for it, but only an authorized organization administrator may select the organization and accept current contracts. Credentials, legal acceptance, session cookies, authorization codes, and tokens must never be copied into an agent conversation or repository.

### 2026-08-08 React + Vite release smoke test

The released [`react-vite-oidc-starter`](https://github.com/Tuurio/react-vite-oidc-starter) was cloned into a disposable clean repository and exercised against a non-production Tuurio organization:

- `manage-tuurio-id@1.1.6` created a browser handoff for the explicit loopback origin `http://127.0.0.1:4173`.
- The administrator completed organization selection and the legal approval in the browser; the agent did not accept contracts or receive credentials.
- Re-running the identical command resumed the saved handoff and configured one React public client instead of creating another authorization flow.
- The CLI wrote only `.env.local` plus the exact `/.env.local` ignore entry. The environment file was ignored and untracked, and contained no client-secret key.
- `npm ci`, `npm run lint`, and `npm run build` passed with zero reported dependency vulnerabilities.
- A real Authorization Code with PKCE sign-in returned through `/auth/callback`, produced an authenticated application state, and loaded the protected user view.
- RP-initiated logout returned through `/logout/callback`; revisiting `/` remained signed out.

No credential, raw token, authorization code, session cookie, or generated environment value is stored in this repository or this acceptance record.

For a browser template, perform the following against a disposable checkout and test organization:

1. Run the exact pinned CLI command from that repository's README with an explicit local loopback or stable HTTPS deployment origin.
2. Complete the browser handoff as a human administrator. If current terms or the DPA are shown, review and accept them yourself.
3. Re-run the identical command if the first invocation used `--no-wait`; the CLI must resume the saved handoff rather than create a new client.
4. Confirm the generated environment target is ignored, untracked, and absent from the Git index. Confirm the generated public-client JSON contains no client secret.
5. Install and build from the clean checkout.
6. Verify a real sign-in, the callback, a protected route, token-expiry handling, and a complete sign-out.

The server and sample test suites exercise callback binding, PKCE requirements, state and nonce validation, ID-token validation boundaries, protected routes, expiry, logout, tenant isolation, and secret handling without weakening the human approval boundary.

## Ongoing release gate

A catalog release is ready only when all of the following remain true:

- `npm run validate` passes in `distribution/`.
- The full-catalog synchronization succeeds.
- The remote verifier reports no content, metadata, topic, template-flag, or management-marker drift.
- Every generated repository's latest validation workflow succeeds.
- At least one compatible browser template completes the live-auth procedure for changes that affect provisioning, callback handling, or logout.
- Direct changes in generated repositories are first transferred to `Tuurio/auth_samples`; routine synchronization never force-pushes.
