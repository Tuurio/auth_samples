import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";
import {
  generateSocialPreviews,
  renderSocialPreviewPng,
  renderSocialPreviewSvg,
  SOCIAL_PREVIEW_HEIGHT,
  SOCIAL_PREVIEW_WIDTH,
  writeSocialPreview,
} from "./generate-social-previews.mjs";

const template = {
  id: "react-vite",
  displayName: "React Vite OIDC Starter",
  framework: "react",
  kind: "browser",
  source: "sample",
};

test("renders a branded preview without transient or sensitive values", () => {
  const svg = renderSocialPreviewSvg(template);
  assert.match(svg, /Tuurio ID/);
  assert.match(svg.replace(/<[^>]+>/g, ""), /React Vite OIDC Starter/);
  assert.match(svg, /Secure browser login with OIDC \+ PKCE/);
  assert.match(svg, /EU-hosted identity/);
  assert.match(svg, /font-family="DejaVu Sans, Arial, Helvetica, sans-serif"/);
  assert.doesNotMatch(svg, /tenantId|client_secret|redirect-uri|@1\./i);
});

test("escapes manifest text before rendering SVG", () => {
  const svg = renderSocialPreviewSvg({ ...template, displayName: "React & <Vite>" });
  assert.match(svg, /React &amp; &lt;Vite&gt;/);
  assert.doesNotMatch(svg, /React & <Vite>/);
});

test("rejects titles that cannot fit without truncation", () => {
  assert.throws(
    () => renderSocialPreviewSvg({ ...template, displayName: "One Two Three Four Five Six Seven Eight Nine" }),
    /does not fit two social-preview title lines/,
  );
  assert.throws(
    () => renderSocialPreviewSvg({ ...template, displayName: "ThisSingleWordCannotFitInTheAvailableSpace" }),
    /contains a word that does not fit/,
  );
  assert.throws(
    () => renderSocialPreviewSvg({ ...template, displayName: "WWWWWWWWWWWWWW" }),
    /contains a word that does not fit/,
  );
  assert.throws(
    () => renderSocialPreviewSvg({ ...template, displayName: "React 登录 Starter" }),
    /outside the reviewed social-preview font set/,
  );
});

test("never routes curated product artwork through the framework generator", async () => {
  await assert.rejects(generateSocialPreviews({ ids: ["ai-saas"] }), /Unknown template id\(s\): ai-saas/);
});

test("renders the same PNG bytes on repeated invocations in one runtime", async () => {
  const svg = renderSocialPreviewSvg(template);
  const [first, second] = await Promise.all([renderSocialPreviewPng(svg), renderSocialPreviewPng(svg)]);
  assert.ok(first.equals(second));
});

test("writes a 1280 by 640 RGB PNG and its SVG source", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-social-preview-"));
  try {
    const result = await writeSocialPreview(template, { root });
    const metadata = await sharp(result.pngPath).metadata();
    assert.equal(metadata.width, SOCIAL_PREVIEW_WIDTH);
    assert.equal(metadata.height, SOCIAL_PREVIEW_HEIGHT);
    assert.equal(metadata.hasAlpha, false);
    assert.match(readFileSync(result.svgPath, "utf8"), /STARTER TEMPLATE/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
