# Tuurio ID agent guides

These are self-contained, reviewable instructions for adding Tuurio ID authentication with coding agents.

- [`AGENTS.md`](./AGENTS.md) is suitable for agents that honor the `AGENTS.md` convention.
- [`CLAUDE.md`](./CLAUDE.md) is suitable for Claude Code.
- The installable Cursor rule remains in [`rules/tuurio-auth.mdc`](../rules/tuurio-auth.mdc).

## Use

1. Open and review the relevant file.
2. Copy that file to the root of the application repository.
3. Commit it with the application so instruction changes remain visible in code review.
4. Ask the coding agent to add or review authentication.

Use the guide for the agent you run; installing both identical files is unnecessary. The guides intentionally contain all executable instructions locally and do not import mutable remote guidance.

## Version updates

The provisioning CLI is deliberately pinned. Updating it requires a reviewed change to the Cursor rule, both guides, their documentation examples, and the plugin version where applicable.
