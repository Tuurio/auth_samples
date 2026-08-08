import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog, repositoryRoot } from "./catalog.mjs";
import {
  renderSocialPreviewSvg,
  SOCIAL_PREVIEW_HEIGHT,
  SOCIAL_PREVIEW_WIDTH,
} from "./generate-social-previews.mjs";

const previewPaths = [".github/social-preview.png", ".github/social-preview.svg"];

export async function validateSocialPreviews({ root = repositoryRoot } = {}) {
  const errors = [];
  const manifest = loadCatalog({ root });

  for (const template of manifest.templates) {
    const prefix = template.id;
    for (const relativePath of previewPaths) {
      if (!template.files?.includes(relativePath)) {
        errors.push(`${prefix}: ${relativePath} is not in the managed file allow-list`);
      }
    }

    const svgPath = resolve(root, template.source, previewPaths[1]);
    const pngPath = resolve(root, template.source, previewPaths[0]);
    if (!existsSync(svgPath)) {
      errors.push(`${prefix}: missing ${previewPaths[1]}`);
    } else {
      const expectedSvg = `${renderSocialPreviewSvg(template)}\n`;
      if (readFileSync(svgPath, "utf8") !== expectedSvg) {
        errors.push(`${prefix}: SVG is stale; run npm run previews`);
      }
    }
    if (!existsSync(pngPath)) {
      errors.push(`${prefix}: missing ${previewPaths[0]}`);
      continue;
    }

    const metadata = await sharp(pngPath).metadata();
    if (metadata.width !== SOCIAL_PREVIEW_WIDTH || metadata.height !== SOCIAL_PREVIEW_HEIGHT) {
      errors.push(`${prefix}: PNG must be ${SOCIAL_PREVIEW_WIDTH}x${SOCIAL_PREVIEW_HEIGHT}`);
    }
    if (metadata.hasAlpha) errors.push(`${prefix}: PNG must not have an alpha channel`);
    if (statSync(pngPath).size > 1_000_000) errors.push(`${prefix}: PNG exceeds 1 MB`);
  }

  return { checked: manifest.templates.length, errors };
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const result = await validateSocialPreviews();
  if (result.errors.length) {
    console.error(result.errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log(`Validated ${result.checked} social previews.`);
}
