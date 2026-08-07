import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import YAML from "yaml";
import { validateManifest } from "./validate-manifest.mjs";

const root = resolve(import.meta.dirname, "../..");
const source = YAML.parse(readFileSync(resolve(root, "distribution/templates.yml"), "utf8"));
const copy = () => structuredClone(source);

test("accepts the checked-in distribution manifest", () => {
  assert.deepEqual(validateManifest(copy(), { repositoryRoot: root }).errors, []);
});

test("rejects unsupported template kinds", () => {
  const manifest = copy();
  manifest.templates[0].kind = "desktop";
  assert.ok(validateManifest(manifest, { repositoryRoot: root }).errors.some((error) => error.includes("kind must")));
});

test("requires stackblitz to be a boolean", () => {
  const manifest = copy();
  manifest.templates[0].stackblitz = "true";
  assert.ok(validateManifest(manifest, { repositoryRoot: root }).errors.some((error) => error.includes("stackblitz")));
});

test("rejects duplicate display names and topics", () => {
  const manifest = copy();
  manifest.templates[1].displayName = manifest.templates[0].displayName;
  manifest.templates[0].topics.push(manifest.templates[0].topics[0]);
  const { errors } = validateManifest(manifest, { repositoryRoot: root });
  assert.ok(errors.some((error) => error.includes("duplicate displayName")));
  assert.ok(errors.some((error) => error.includes("duplicate GitHub topic")));
});

test("enforces the catalog identity, license, and cardinality", () => {
  const manifest = copy();
  manifest.version = 2;
  manifest.license = "MIT";
  manifest.sourceRepository = "Example/auth_samples";
  manifest.templates.pop();
  const { errors } = validateManifest(manifest, { repositoryRoot: root });
  assert.ok(errors.includes("manifest version must be 1"));
  assert.ok(errors.includes("manifest license must be Apache-2.0"));
  assert.ok(errors.includes("unexpected source repository"));
  assert.ok(errors.some((error) => error.includes("expected 20 templates")));
  assert.ok(errors.some((error) => error.includes("expected 6 planned templates")));
});

test("rejects duplicate repository and campaign values", () => {
  const manifest = copy();
  manifest.templates[1].repository = manifest.templates[0].repository;
  manifest.templates[1].campaign = manifest.templates[0].campaign;
  const { errors } = validateManifest(manifest, { repositoryRoot: root });
  assert.ok(errors.some((error) => error.includes("duplicate repository")));
  assert.ok(errors.some((error) => error.includes("duplicate campaign")));
});

test("rejects unsafe metadata and a missing ready source", () => {
  const manifest = copy();
  manifest.templates[0].homepage = "http://example.com";
  manifest.templates[0].campaign = "cursor-directory";
  manifest.templates[0].topics = ["-invalid"];
  manifest.templates[0].source = "missing-source";
  const { errors } = validateManifest(manifest, { repositoryRoot: root });
  assert.ok(errors.some((error) => error.includes("homepage must be HTTPS")));
  assert.ok(errors.some((error) => error.includes("campaign must use")));
  assert.ok(errors.some((error) => error.includes("invalid GitHub topic")));
  assert.ok(errors.some((error) => error.includes("ready source must exist")));
});
