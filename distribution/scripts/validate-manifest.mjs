import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import YAML from "yaml";

const root = resolve(import.meta.dirname, "../..");
const manifestPath = resolve(root, "distribution/templates.yml");
const manifest = YAML.parse(readFileSync(manifestPath, "utf8"));
const errors = [];

const requireUnique = (templates, field) => {
  const values = new Set();
  for (const template of templates) {
    const value = template[field];
    if (!value) {
      errors.push(`${template.id ?? "unknown"}: missing ${field}`);
    } else if (values.has(value)) {
      errors.push(`${template.id ?? "unknown"}: duplicate ${field} ${value}`);
    }
    values.add(value);
  }
};

if (manifest.version !== 1) errors.push("manifest version must be 1");
if (manifest.license !== "Apache-2.0") errors.push("manifest license must be Apache-2.0");
if (manifest.sourceRepository !== "Tuurio/auth_samples") errors.push("unexpected source repository");
if (!manifest.sourceMetadata?.description || manifest.sourceMetadata.description.length > 350) {
  errors.push("source repository description must contain 1-350 characters");
}
if (!manifest.sourceMetadata?.homepage?.startsWith("https://")) {
  errors.push("source repository homepage must be HTTPS");
}
if (!Array.isArray(manifest.sourceMetadata?.topics) || manifest.sourceMetadata.topics.length > 20) {
  errors.push("source repository topics must contain at most 20 entries");
} else {
  for (const topic of manifest.sourceMetadata.topics) {
    if (!/^[a-z0-9-]{1,50}$/.test(topic)) {
      errors.push(`invalid source repository topic ${topic}`);
    }
  }
}

const templates = Array.isArray(manifest.templates) ? manifest.templates : [];
if (templates.length !== 20) errors.push(`expected 20 templates, found ${templates.length}`);

for (const field of ["id", "source", "repository", "campaign"]) {
  requireUnique(templates, field);
}

for (const template of templates) {
  const prefix = template.id ?? "unknown";
  if (!['ready', 'planned'].includes(template.status)) {
    errors.push(`${prefix}: status must be ready or planned`);
  }
  if (!template.repository?.startsWith("Tuurio/")) {
    errors.push(`${prefix}: repository must belong to Tuurio`);
  }
  if (!template.displayName || template.displayName.length > 80) {
    errors.push(`${prefix}: displayName must contain 1-80 characters`);
  }
  if (!template.description || template.description.length > 350) {
    errors.push(`${prefix}: description must contain 1-350 characters`);
  }
  if (!template.homepage?.startsWith("https://")) {
    errors.push(`${prefix}: homepage must be HTTPS`);
  }
  if (!/^github_[a-z0-9_]+$/.test(template.campaign ?? "")) {
    errors.push(`${prefix}: campaign must use the github_<slug> format`);
  }
  if (!Array.isArray(template.topics) || template.topics.length < 1 || template.topics.length > 20) {
    errors.push(`${prefix}: topics must contain 1-20 entries`);
  } else {
    for (const topic of template.topics) {
      if (!/^[a-z0-9-]{1,50}$/.test(topic)) {
        errors.push(`${prefix}: invalid GitHub topic ${topic}`);
      }
    }
  }
  if (!Array.isArray(template.verify) || template.verify.length < 1) {
    errors.push(`${prefix}: at least one verification command is required`);
  }
  if (template.status === "ready") {
    try {
      const sourcePath = resolve(root, template.source);
      readFileSync(resolve(sourcePath, "README.md"), "utf8");
    } catch {
      errors.push(`${prefix}: ready source must exist and contain README.md`);
    }
  }
}

const readyCount = templates.filter((template) => template.status === "ready").length;
const plannedCount = templates.filter((template) => template.status === "planned").length;
if (readyCount !== 14) errors.push(`expected 14 ready templates, found ${readyCount}`);
if (plannedCount !== 6) errors.push(`expected 6 planned templates, found ${plannedCount}`);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${templates.length} templates (${readyCount} ready, ${plannedCount} planned).`);
