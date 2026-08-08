# Social preview specification

Every public satellite repository needs a reviewed 1280 × 640 social preview.

Generate all 20 framework previews from the reviewed catalog metadata:

```bash
cd distribution
npm ci
npm run previews
```

Use `npm run previews -- --id react-vite` to regenerate one asset. Each source
directory receives a canonical `.github/social-preview.svg` and the upload-ready
`.github/social-preview.png`. Both files are synchronized to the corresponding
satellite. The AI SaaS Starter keeps its intentionally product-specific
`.github/social-preview.png`; validation checks its allow-list entry, dimensions,
alpha channel, file size, and decodability without replacing the artwork with a
framework card. GitHub does not currently expose a supported REST endpoint for
setting a repository's social preview, so upload each generated PNG once under
**Settings → General → Social preview**. Subsequent visual changes use the same
versioned source and generator.

Required content:

- Tuurio ID wordmark.
- Framework or platform name.
- Short outcome, for example “Secure React login with OIDC + PKCE”.
- “EU-hosted identity” only as an identity-hosting statement, not as a claim about the complete application.
- High-contrast background and text that remains legible in GitHub's cropped previews.

Do not place tenant identifiers, callback URLs, credentials, tokens, user data, or transient version numbers in social previews.

The framework cards use the pinned DejaVu Sans font files and `resvg` renderer
from `distribution/package-lock.json`. The validator regenerates each expected
PNG and compares decoded pixels, so output remains independent of fonts
installed on the CI runner or contributor machine. A narrow raster tolerance
allows insignificant anti-aliasing differences between CPU architectures while
still rejecting visible or widespread drift. The SVG source declares
Arial, Helvetica, and the browser generic sans-serif as viewing fallbacks; the
committed PNG always uses the pinned DejaVu files.
