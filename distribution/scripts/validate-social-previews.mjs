import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog, repositoryRoot } from "./catalog.mjs";
import {
  renderSocialPreviewPng,
  renderSocialPreviewSvg,
  SOCIAL_PREVIEW_HEIGHT,
  SOCIAL_PREVIEW_WIDTH,
} from "./generate-social-previews.mjs";

const previewPaths = [".github/social-preview.png", ".github/social-preview.svg"];
const ignoredChannelDelta = 2;
const maximumChannelDelta = 16;
const maximumMaterialPixelRatio = 0.001;

function pixelsMatchWithinRasterTolerance(expected, actual) {
  if (
    expected.info.width !== actual.info.width ||
    expected.info.height !== actual.info.height ||
    expected.info.channels !== actual.info.channels ||
    expected.data.length !== actual.data.length
  ) {
    return false;
  }

  let largestChannelDelta = 0;
  let materiallyDifferentPixels = 0;
  for (let offset = 0; offset < expected.data.length; offset += expected.info.channels) {
    let largestPixelDelta = 0;
    for (let channel = 0; channel < expected.info.channels; channel += 1) {
      const delta = Math.abs(expected.data[offset + channel] - actual.data[offset + channel]);
      largestChannelDelta = Math.max(largestChannelDelta, delta);
      largestPixelDelta = Math.max(largestPixelDelta, delta);
    }
    if (largestPixelDelta > ignoredChannelDelta) materiallyDifferentPixels += 1;
  }

  const totalPixels = expected.info.width * expected.info.height;
  return (
    largestChannelDelta <= maximumChannelDelta &&
    materiallyDifferentPixels / totalPixels <= maximumMaterialPixelRatio
  );
}

async function validatePng(template, pngPath, errors) {
  const prefix = template.id;
  if (!existsSync(pngPath)) {
    errors.push(`${prefix}: missing ${previewPaths[0]}`);
    return null;
  }

  try {
    const metadata = await sharp(pngPath).metadata();
    if (metadata.width !== SOCIAL_PREVIEW_WIDTH || metadata.height !== SOCIAL_PREVIEW_HEIGHT) {
      errors.push(`${prefix}: PNG must be ${SOCIAL_PREVIEW_WIDTH}x${SOCIAL_PREVIEW_HEIGHT}`);
    }
    if (metadata.hasAlpha) errors.push(`${prefix}: PNG must not have an alpha channel`);
    if (statSync(pngPath).size > 1_000_000) errors.push(`${prefix}: PNG exceeds 1 MB`);
    return metadata;
  } catch (error) {
    errors.push(`${prefix}: PNG cannot be decoded (${error.message})`);
    return null;
  }
}

export async function validateGeneratedSocialPreview(template, { root = repositoryRoot } = {}) {
  const errors = [];
  const prefix = template.id;
  for (const relativePath of previewPaths) {
    if (!template.files?.includes(relativePath)) {
      errors.push(`${prefix}: ${relativePath} is not in the managed file allow-list`);
    }
  }

  const svgPath = resolve(root, template.source, previewPaths[1]);
  const pngPath = resolve(root, template.source, previewPaths[0]);
  const expectedSvgSource = renderSocialPreviewSvg(template);
  const expectedSvg = `${expectedSvgSource}\n`;
  if (!existsSync(svgPath)) {
    errors.push(`${prefix}: missing ${previewPaths[1]}`);
  } else if (readFileSync(svgPath, "utf8") !== expectedSvg) {
    errors.push(`${prefix}: SVG is stale; run npm run previews`);
  }

  if (!(await validatePng(template, pngPath, errors))) return errors;

  const expectedPng = await renderSocialPreviewPng(expectedSvgSource);
  const [expectedPixels, actualPixels] = await Promise.all([
    sharp(expectedPng).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true }),
    sharp(pngPath).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (!pixelsMatchWithinRasterTolerance(expectedPixels, actualPixels)) {
    errors.push(`${prefix}: PNG is stale; run npm run previews`);
  }
  return errors;
}

export async function validateCuratedSocialPreview(entry, { root = repositoryRoot } = {}) {
  const errors = [];
  if (!entry.files?.includes(previewPaths[0])) {
    errors.push(`${entry.id}: ${previewPaths[0]} is not in the managed file allow-list`);
  }
  await validatePng(entry, resolve(root, entry.source, previewPaths[0]), errors);
  return errors;
}

export async function validateSocialPreviews({ root = repositoryRoot } = {}) {
  const errors = [];
  const manifest = loadCatalog({ root });
  let generatedChecked = 0;
  let curatedChecked = 0;

  for (const template of manifest.templates) {
    generatedChecked += 1;
    errors.push(...(await validateGeneratedSocialPreview(template, { root })));
  }

  // Product artwork is deliberately bespoke. Validate its packaging constraints,
  // but never overwrite it with the framework-template generator.
  for (const product of manifest.products ?? []) {
    curatedChecked += 1;
    errors.push(...(await validateCuratedSocialPreview(product, { root })));
  }

  return { checked: generatedChecked + curatedChecked, generatedChecked, curatedChecked, errors };
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const result = await validateSocialPreviews();
  if (result.errors.length) {
    console.error(result.errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log(
    `Validated ${result.generatedChecked} generated social previews and ${result.curatedChecked} curated product preview.`,
  );
}
