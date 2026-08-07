import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { validateManifest } from "./validate-manifest.mjs";

export const repositoryRoot = resolve(import.meta.dirname, "../..");
export const manifestPath = resolve(repositoryRoot, "distribution/templates.yml");

export function loadCatalog({ root = repositoryRoot } = {}) {
  const path = resolve(root, "distribution/templates.yml");
  const manifest = YAML.parse(readFileSync(path, "utf8"));
  const result = validateManifest(manifest, { repositoryRoot: root });
  if (result.errors.length) {
    throw new Error(`Invalid distribution manifest:\n${result.errors.map((error) => `- ${error}`).join("\n")}`);
  }
  return manifest;
}

export function selectTemplates(manifest, ids = []) {
  const requested = new Set(ids.filter(Boolean));
  const templates = manifest.templates.filter((template) => requested.size === 0 || requested.has(template.id));
  const found = new Set(templates.map((template) => template.id));
  const missing = [...requested].filter((id) => !found.has(id));
  if (missing.length) throw new Error(`Unknown template id(s): ${missing.join(", ")}`);
  return templates;
}

export function parseCommonArgs(argv) {
  const ids = [];
  let output = null;
  let apply = false;
  let initialize = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--id") {
      const value = argv[index + 1];
      if (!value) throw new Error("--id requires a value");
      ids.push(value);
      index += 1;
    } else if (argument === "--output") {
      output = argv[index + 1];
      if (!output) throw new Error("--output requires a value");
      index += 1;
    } else if (argument === "--apply") {
      apply = true;
    } else if (argument === "--initialize") {
      initialize = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { ids, output, apply, initialize };
}
