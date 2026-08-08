import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { distributables, loadCatalog } from "./catalog.mjs";
import { writeSocialPreview } from "./generate-social-previews.mjs";
import {
  validateCuratedSocialPreview,
  validateGeneratedSocialPreview,
  validateSocialPreviews,
} from "./validate-social-previews.mjs";

const template = {
  id: "test-react",
  displayName: "Test React Starter",
  framework: "react",
  kind: "browser",
  source: "sample",
  files: [".github/social-preview.png", ".github/social-preview.svg"],
};

test("validates every checked-in framework social preview", async () => {
  const manifest = loadCatalog();
  const result = await validateSocialPreviews();
  assert.equal(result.checked, distributables(manifest).length);
  assert.equal(result.generatedChecked, manifest.templates.length);
  assert.equal(result.curatedChecked, manifest.products.length);
  assert.deepEqual(result.errors, []);
});

test("reports missing files and unmanaged preview paths", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-preview-validation-"));
  try {
    const errors = await validateGeneratedSocialPreview({ ...template, files: [] }, { root });
    assert.ok(errors.some((error) => error.includes("social-preview.png is not in the managed file allow-list")));
    assert.ok(errors.some((error) => error.includes("social-preview.svg is not in the managed file allow-list")));
    assert.ok(errors.some((error) => error.includes("missing .github/social-preview.svg")));
    assert.ok(errors.some((error) => error.includes("missing .github/social-preview.png")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("detects stale SVG and PNG content", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-preview-validation-"));
  try {
    const { svgPath, pngPath } = await writeSocialPreview(template, { root });
    writeFileSync(svgPath, "<svg xmlns=\"http://www.w3.org/2000/svg\"/>");
    await sharp({
      create: { width: 1280, height: 640, channels: 3, background: "#ffffff" },
    })
      .png()
      .toFile(pngPath);

    const errors = await validateGeneratedSocialPreview(template, { root });
    assert.ok(errors.some((error) => error.includes("SVG is stale")));
    assert.ok(errors.some((error) => error.includes("PNG is stale")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("detects invalid dimensions, alpha, and oversized PNG files", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-preview-validation-"));
  try {
    const { pngPath } = await writeSocialPreview(template, { root });
    await sharp({
      create: { width: 640, height: 320, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.5 } },
    })
      .png()
      .toFile(pngPath);
    appendFileSync(pngPath, Buffer.alloc(1_000_000));

    const errors = await validateGeneratedSocialPreview(template, { root });
    assert.ok(errors.some((error) => error.includes("PNG must be 1280x640")));
    assert.ok(errors.some((error) => error.includes("PNG must not have an alpha channel")));
    assert.ok(errors.some((error) => error.includes("PNG exceeds 1 MB")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects corrupt curated product artwork and an unmanaged path", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-preview-validation-"));
  const product = { id: "test-product", source: "product", files: [] };
  try {
    const directory = resolve(root, product.source, ".github");
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, "social-preview.png"), "not a PNG");

    const errors = await validateCuratedSocialPreview(product, { root });
    assert.ok(errors.some((error) => error.includes("social-preview.png is not in the managed file allow-list")));
    assert.ok(errors.some((error) => error.includes("PNG cannot be decoded")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
