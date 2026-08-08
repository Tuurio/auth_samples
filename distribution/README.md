# Template distribution operations

`auth_samples` is the source of truth for 20 public GitHub template repositories. Satellite repositories are normal repositories with preserved issues, settings, and unmanaged files; synchronization updates only files listed in `.tuurio-template.json` and never force-pushes.

## Automation

- A push to `main` computes the affected catalog entries from changed source paths and synchronizes only those satellites.
- Changes to shared package inputs (`LICENSE`, the generated README, the catalog, or the packager) synchronize the full catalog.
- **Sync template satellites** can be dispatched manually with `full_catalog=true` for a reviewed full-catalog repair.
- **Verify template satellites** runs nightly and can also be dispatched manually. It compares package checksums, every managed file checksum, the management marker, repository metadata, topics, and the GitHub template flag.
- Synchronization uses ordinary commits on each satellite's `main` branch. A conflict or rejected push fails visibly; automation never force-pushes or silently rewrites history.

The synchronization workflow requires `SATELLITE_SYNC_TOKEN`, a fine-grained token scoped only to the 20 managed satellite repositories with repository contents write access. It is available only to trusted `main` pushes and manual workflow dispatches, never pull requests.

## Local commands

From `distribution/`:

```bash
npm ci
npm run validate
npm run affected -- --base <base-sha> --head <head-sha>
npm run sync -- --id react-vite
npm run verify:remotes -- --id react-vite
```

Dry-run is the default. Add `--apply` only after reviewing the package and target repository. A manual full-catalog synchronization omits `--id`; the GitHub workflow is preferred because it provides per-template isolation and summaries.

## Contribution policy

Implementation changes belong in this repository under the source path named in the satellite's `.tuurio-template.json`. Open pull requests against `Tuurio/auth_samples`, run the source sample's tests plus `npm run validate` in `distribution/`, and let the post-merge workflow propagate the reviewed result.

Do not submit generated implementation changes directly to a satellite: they can be replaced by the next synchronization. Satellite-specific issues, discussions, stars, repository settings, and files outside the management marker remain in the satellite and are intentionally preserved.

If a synchronization is wrong, revert the normal synchronization commit in the affected satellite and fix or revert the source change here. Do not delete the marker, bypass the allow-list, or force-push a satellite.
