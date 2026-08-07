import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadCatalog, parseCommonArgs, repositoryRoot, selectTemplates } from "./catalog.mjs";
import { ghJson, run } from "./github.mjs";
import { packageTemplate, resolveSourceSha } from "./package-template.mjs";

const checksum = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function managedFilesByPath(marker) {
  return new Map((marker.managedFiles ?? []).map((entry) => [entry.path, entry.sha256]));
}

export function compareMarkers(actual, expected) {
  const errors = [];
  for (const field of ["schemaVersion", "sourceRepository", "sourcePath", "sourceSha", "templateId"]) {
    if (actual[field] !== expected[field]) errors.push(`marker ${field} mismatch`);
  }
  const actualFiles = managedFilesByPath(actual);
  const expectedFiles = managedFilesByPath(expected);
  for (const [path, hash] of expectedFiles) {
    if (!actualFiles.has(path)) errors.push(`marker missing managed file ${path}`);
    else if (actualFiles.get(path) !== hash) errors.push(`marker checksum mismatch ${path}`);
  }
  for (const path of actualFiles.keys()) {
    if (!expectedFiles.has(path)) errors.push(`marker has unexpected managed file ${path}`);
  }
  return errors;
}

export function verifyTemplate(template, { root = repositoryRoot } = {}) {
  const temporary = mkdtempSync(resolve(tmpdir(), `tuurio-verify-${template.id}-`));
  const errors = [];
  try {
    const expectedDirectory = resolve(temporary, "expected");
    const remoteDirectory = resolve(temporary, "remote");
    const sourceSha = resolveSourceSha(root);
    const expected = packageTemplate(template, { root, output: expectedDirectory, sourceSha }).marker;
    run("git", ["clone", "--depth", "1", `https://github.com/${template.repository}.git`, remoteDirectory]);
    const markerPath = resolve(remoteDirectory, ".tuurio-template.json");
    if (!existsSync(markerPath)) return { template: template.id, repository: template.repository, errors: ["missing management marker"] };
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    errors.push(...compareMarkers(marker, expected));
    for (const entry of marker.managedFiles ?? []) {
      const path = resolve(remoteDirectory, entry.path);
      const fromRoot = path.startsWith(`${remoteDirectory}/`);
      if (!fromRoot || !existsSync(path)) errors.push(`missing managed file ${entry.path}`);
      else if (checksum(path) !== entry.sha256) errors.push(`drifted managed file ${entry.path}`);
    }
    const metadata = ghJson(["repo", "view", template.repository, "--json", "description,homepageUrl,isTemplate,repositoryTopics"]);
    if (metadata.description !== template.description) errors.push("description mismatch");
    if (metadata.homepageUrl !== template.homepage) errors.push("homepage mismatch");
    if (!metadata.isTemplate) errors.push("repository is not a template");
    const actualTopics = new Set((metadata.repositoryTopics ?? []).map((entry) => entry.name));
    for (const topic of template.topics) if (!actualTopics.has(topic)) errors.push(`missing topic ${topic}`);
    return { template: template.id, repository: template.repository, sourceSha: marker.sourceSha, errors: [...new Set(errors)] };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = parseCommonArgs(process.argv.slice(2));
  const results = selectTemplates(loadCatalog(), args.ids)
    .filter((template) => template.files)
    .map(verifyTemplate);
  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => result.errors.length)) process.exitCode = 1;
}
