import { cpSync, existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadCatalog, parseCommonArgs, repositoryRoot, selectTemplates } from "./catalog.mjs";
import { packageTemplate, resolveSourceSha } from "./package-template.mjs";
import { run } from "./github.mjs";

function assertManagedPath(root, path) {
  if (typeof path !== "string" || !path || isAbsolute(path)) throw new Error(`Unsafe managed path: ${String(path)}`);
  const absolute = resolve(root, path);
  const fromRoot = relative(resolve(root), absolute);
  if (fromRoot === "" || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error(`Unsafe managed path: ${path}`);
  }
  return absolute;
}

function repositoryHasContent(clone) {
  return readdirSync(clone).some((name) => name !== ".git");
}

export function removeManagedFiles(clone, marker) {
  if (marker.sourceRepository !== "Tuurio/auth_samples" || !Array.isArray(marker.managedFiles)) {
    throw new Error("Invalid management marker");
  }
  for (const entry of marker.managedFiles) {
    if (!entry || typeof entry !== "object") throw new Error("Invalid managed file entry");
    rmSync(assertManagedPath(clone, entry.path), { recursive: true, force: true });
  }
  rmSync(resolve(clone, ".tuurio-template.json"), { force: true });
}

export function copyPackageContents(packaged, clone) {
  for (const name of readdirSync(packaged).sort()) {
    cpSync(resolve(packaged, name), resolve(clone, name), { recursive: true, force: true });
  }
}

function packageFiles(root, current = root) {
  const files = [];
  for (const name of readdirSync(current).sort()) {
    const absolute = resolve(current, name);
    const metadata = lstatSync(absolute);
    if (metadata.isDirectory()) files.push(...packageFiles(root, absolute));
    else if (metadata.isFile()) files.push(relative(root, absolute));
    else throw new Error(`Unsupported packaged entry: ${absolute}`);
  }
  return files;
}

export function assertNoUnmanagedCollisions(packaged, clone) {
  for (const path of packageFiles(packaged)) {
    const destination = assertManagedPath(clone, path);
    let parent = resolve(destination, "..");
    while (parent !== resolve(clone)) {
      if (existsSync(parent) && lstatSync(parent).isSymbolicLink()) {
        throw new Error(`Packaged path crosses an unmanaged symbolic link: ${path}`);
      }
      parent = resolve(parent, "..");
    }
    if (existsSync(destination)) {
      throw new Error(`Packaged path would overwrite an unmanaged file: ${path}`);
    }
  }
}

export function syncTemplate(template, { apply = false, initialize = false, root = repositoryRoot } = {}) {
  const temporary = mkdtempSync(resolve(tmpdir(), `tuurio-sync-${template.id}-`));
  try {
    const packaged = resolve(temporary, "package");
    const clone = resolve(temporary, "repository");
    const sourceSha = resolveSourceSha(root);
    packageTemplate(template, { root, output: packaged, sourceSha });
    run("git", ["clone", `https://github.com/${template.repository}.git`, clone]);

    const markerPath = resolve(clone, ".tuurio-template.json");
    if (repositoryHasContent(clone) && !existsSync(markerPath) && !initialize) {
      throw new Error(`${template.repository} contains unmanaged files; rerun with --initialize only after review`);
    }
    if (existsSync(markerPath)) {
      const prior = JSON.parse(readFileSync(markerPath, "utf8"));
      try {
        removeManagedFiles(clone, prior);
      } catch (error) {
        throw new Error(`${template.repository} has an invalid management marker: ${error.message}`);
      }
    }
    assertNoUnmanagedCollisions(packaged, clone);
    copyPackageContents(packaged, clone);
    run("git", ["add", "--all"], { cwd: clone });
    const status = run("git", ["status", "--short"], { cwd: clone });
    if (!status) return { template: template.id, repository: template.repository, changed: false, applied: false };
    if (!apply) return { template: template.id, repository: template.repository, changed: true, applied: false, status };

    run("git", ["config", "user.name", "Tuurio Template Sync"], { cwd: clone });
    run("git", ["config", "user.email", "templates@tuurio.com"], { cwd: clone });
    run("git", ["commit", "-m", `chore: sync ${template.displayName} from auth_samples@${sourceSha.slice(0, 12)}`], { cwd: clone });
    run("git", ["push", "origin", "HEAD:main"], { cwd: clone });
    return { template: template.id, repository: template.repository, changed: true, applied: true, sourceSha };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = parseCommonArgs(process.argv.slice(2));
  const templates = selectTemplates(loadCatalog(), args.ids).filter((template) => template.files);
  const results = templates.map((template) => syncTemplate(template, {
    apply: args.apply,
    initialize: args.initialize,
  }));
  console.log(JSON.stringify(results, null, 2));
}
