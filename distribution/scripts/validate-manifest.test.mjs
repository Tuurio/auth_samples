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
