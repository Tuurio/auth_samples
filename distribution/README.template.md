# {{displayName}}

{{description}}

[![Verify template](https://github.com/{{repository}}/actions/workflows/verify.yml/badge.svg)](https://github.com/{{repository}}/actions/workflows/verify.yml)

> Generated from [`Tuurio/auth_samples/{{source}}`](https://github.com/Tuurio/auth_samples/tree/main/{{source}}). Submit implementation fixes upstream so they are not replaced by the next synchronized release.

## What you get

- Standards-based OpenID Connect authentication with framework-native integration.
- Exact redirect and post-logout redirect handling.
- Protected-route and logout examples.
- A reviewed, pinned Tuurio provisioning workflow.

## Quickstart

1. Create a repository with **Use this template** or clone this repository.
2. Follow the framework-specific prerequisites below.
3. Review and run this pinned provisioning command:

```bash
{{quickstartCommand}}
```

4. Approve the exact command, then complete the secure browser handoff yourself.
5. Run the build and verify one real sign-in and sign-out.

Never paste credentials, client secrets, authorization codes, tokens, session cookies, or environment-file contents into an agent chat. Browser and native applications are public clients and must not contain a client secret.

## Runtime and verification

- Runtime: {{runtime}}
- Package manager: {{packageManager}}
- Verification: `{{verifySummary}}`

## Security model

This starter uses OpenID Connect Authorization Code flow. Browser clients use PKCE S256 and contain no client secret. Redirect and post-logout redirect URIs must match exactly. The framework OIDC integration validates issuer, audience, signature, time claims, state, and nonce before authenticated state is accepted. Keep generated local environment files ignored and never commit tokens or credentials.

## Framework instructions

{{sourceReadme}}

## License

Licensed under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE).
