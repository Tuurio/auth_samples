import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = resolve(import.meta.dirname, "../..");
const manifestPath = resolve(root, "distribution/templates.yml");

const requireUnique = (templates, field, errors) => {
  const values = new Set();
  for (const template of templates) {
    const value = template[field];
    if (!value) {
      errors.push(`${template.id ?? "unknown"}: missing ${field}`);
    } else if (values.has(value)) {
      errors.push(`${template.id ?? "unknown"}: duplicate ${field} ${value}`);
    } else {
      values.add(value);
    }
  }
};

const SAFE_RELATIVE_PATH = /^(?!\/)(?!.*(?:^|[\\/])\.\.(?:[\\/]|$))[^\0]+$/;

const validateCommand = (value, field, errors) => {
  if (typeof value !== "string" || !value.trim() || /[\r\n\0]/.test(value)) {
    errors.push(`${field} must be a non-empty single-line command`);
  }
};

export const validateManifest = (manifest, { repositoryRoot = root } = {}) => {
  const errors = [];

  if (manifest.version !== 1) errors.push("manifest version must be 1");
  if (manifest.license !== "Apache-2.0") errors.push("manifest license must be Apache-2.0");
  if (manifest.sourceRepository !== "Tuurio/auth_samples") errors.push("unexpected source repository");
  if (!manifest.sourceMetadata?.description || manifest.sourceMetadata.description.length > 350) {
    errors.push("source repository description must contain 1-350 characters");
  }
  if (!manifest.sourceMetadata?.homepage?.startsWith("https://")) {
    errors.push("source repository homepage must be HTTPS");
  }
  if (
    !Array.isArray(manifest.sourceMetadata?.topics) ||
    manifest.sourceMetadata.topics.length < 1 ||
    manifest.sourceMetadata.topics.length > 20
  ) {
    errors.push("source repository topics must contain 1-20 entries");
  } else {
    const sourceTopics = new Set();
    for (const topic of manifest.sourceMetadata.topics) {
      if (!/^[a-z0-9][a-z0-9-]{0,49}$/.test(topic)) {
        errors.push(`invalid source repository topic ${topic}`);
      } else if (sourceTopics.has(topic)) {
        errors.push(`duplicate source repository topic ${topic}`);
      }
      sourceTopics.add(topic);
    }
  }

  const templates = Array.isArray(manifest.templates) ? manifest.templates : [];
  const products = Array.isArray(manifest.products) ? manifest.products : [];
  if (templates.length !== 20) errors.push(`expected 20 templates, found ${templates.length}`);
  if (products.length !== 1) errors.push(`expected 1 product starter, found ${products.length}`);

  const distributables = [...templates, ...products];

  for (const field of ["id", "displayName", "source", "repository", "campaign"]) {
    requireUnique(distributables, field, errors);
  }

  for (const template of distributables) {
    const prefix = template.id ?? "unknown";
    if (!["ready", "planned"].includes(template.status)) {
      errors.push(`${prefix}: status must be ready or planned`);
    }
    if (!["browser", "server", "native"].includes(template.kind)) {
      errors.push(`${prefix}: kind must be browser, server, or native`);
    }
    if (typeof template.stackblitz !== "boolean") {
      errors.push(`${prefix}: stackblitz must be a boolean`);
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
      const topics = new Set();
      for (const topic of template.topics) {
        if (!/^[a-z0-9][a-z0-9-]{0,49}$/.test(topic)) {
          errors.push(`${prefix}: invalid GitHub topic ${topic}`);
        } else if (topics.has(topic)) {
          errors.push(`${prefix}: duplicate GitHub topic ${topic}`);
        }
        topics.add(topic);
      }
    }
    if (!Array.isArray(template.verify) || template.verify.length < 1) {
      errors.push(`${prefix}: at least one verification command is required`);
    } else {
      template.verify.forEach((command, index) => validateCommand(command, `${prefix}.verify[${index}]`, errors));
    }
    if (template.start !== undefined) {
      validateCommand(template.start, `${prefix}.start`, errors);
    }
    if (template.files !== undefined) {
      if (!Array.isArray(template.files) || template.files.length < 1) {
        errors.push(`${prefix}: files must contain at least one allow-listed path`);
      } else {
        const paths = new Set();
        for (const path of template.files) {
          if (typeof path !== "string" || !SAFE_RELATIVE_PATH.test(path)) {
            errors.push(`${prefix}: unsafe allow-listed path ${String(path)}`);
          } else if (paths.has(path)) {
            errors.push(`${prefix}: duplicate allow-listed path ${path}`);
          }
          paths.add(path);
        }
      }
      for (const field of ["framework", "runtime", "packageManager"]) {
        if (typeof template[field] !== "string" || !template[field].trim()) {
          errors.push(`${prefix}: ${field} is required when files are configured`);
        }
      }
      if (typeof template.framework === "string" && !/^[a-z0-9.+-]{1,24}$/.test(template.framework)) {
        errors.push(`${prefix}: framework must use 1-24 lowercase ASCII slug characters`);
      }
    }
    if (template.status === "ready") {
      try {
        const sourcePath = resolve(repositoryRoot, template.source);
        readFileSync(resolve(sourcePath, "README.md"), "utf8");
      } catch {
        errors.push(`${prefix}: ready source must exist and contain README.md`);
      }
    }
  }

  const readyCount = templates.filter((template) => template.status === "ready").length;
  const plannedCount = templates.filter((template) => template.status === "planned").length;
  if (readyCount !== 20) errors.push(`expected 20 ready templates, found ${readyCount}`);
  if (plannedCount !== 0) errors.push(`expected 0 planned templates, found ${plannedCount}`);
  const readyProductCount = products.filter((product) => product.status === "ready").length;
  if (readyProductCount !== 1) errors.push(`expected 1 ready product starter, found ${readyProductCount}`);

  return { errors, templates, products, distributables, readyCount, plannedCount, readyProductCount };
};

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const manifest = YAML.parse(readFileSync(manifestPath, "utf8"));
  const result = validateManifest(manifest);
  if (result.errors.length) {
    console.error(result.errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log(
    `Validated ${result.templates.length} templates and ${result.products.length} product starter (${result.readyCount + result.readyProductCount} ready total).`,
  );
}
