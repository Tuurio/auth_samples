import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";
import {
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
  assert.match(svg, /React Vite OIDC Starter/);
  assert.match(svg, /Secure browser login with OIDC \+ PKCE/);
  assert.match(svg, /EU-hosted identity/);
  assert.doesNotMatch(svg, /tenantId|client_secret|redirect-uri|@1\./i);
});

test("escapes manifest text before rendering SVG", () => {
  const svg = renderSocialPreviewSvg({ ...template, displayName: "React & <Vite>" });
  assert.match(svg, /React &amp; &lt;Vite&gt;/);
  assert.doesNotMatch(svg, /React & <Vite>/);
});

test("writes a 1280 by 640 RGB PNG and its SVG source", async () => {
  const root = mkdtempSync(resolve(tmpdir(), "tuurio-social-preview-"));
  const result = await writeSocialPreview(template, { root });
  const metadata = await sharp(result.pngPath).metadata();
  assert.equal(metadata.width, SOCIAL_PREVIEW_WIDTH);
  assert.equal(metadata.height, SOCIAL_PREVIEW_HEIGHT);
  assert.equal(metadata.hasAlpha, false);
  assert.match(readFileSync(result.svgPath, "utf8"), /STARTER TEMPLATE/);
});
