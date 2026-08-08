import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadCatalog, repositoryRoot } from "./catalog.mjs";

const GLOBAL_PACKAGE_INPUTS = new Set([
  "LICENSE",
  "distribution/README.template.md",
  "distribution/scripts/package-template.mjs",
  "distribution/templates.yml",
]);

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function affectedTemplateIds(templates, changedFiles, { fullCatalog = false } = {}) {
  const ready = templates.filter((template) => template.status === "ready" && template.files);
  if (fullCatalog) return ready.map((template) => template.id);
  const paths = changedFiles.map(normalizePath);
  if (paths.some((path) => GLOBAL_PACKAGE_INPUTS.has(path))) {
    return ready.map((template) => template.id);
  }
  return ready
    .filter((template) => paths.some((path) => path === template.source || path.startsWith(`${template.source}/`)))
    .map((template) => template.id);
}

export function changedFilesBetween(base, head, { root = repositoryRoot } = {}) {
  if (!base || !head) throw new Error("Both --base and --head are required unless --all is used");
  if (/^0+$/.test(base)) return ["distribution/templates.yml"];
  const output = execFileSync("git", ["diff", "--name-only", "-z", base, head, "--"], {
    cwd: root,
    encoding: "utf8",
  });
  return output.split("\0").filter(Boolean).map(normalizePath);
}

function parseArgs(argv) {
  let base = null;
  let head = null;
  let fullCatalog = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--base" || argument === "--head") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value`);
      if (argument === "--base") base = value;
      else head = value;
      index += 1;
    } else if (argument === "--all") {
      fullCatalog = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { base, head, fullCatalog };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = parseArgs(process.argv.slice(2));
  const catalog = loadCatalog();
  const changedFiles = args.fullCatalog ? [] : changedFilesBetween(args.base, args.head);
  const ids = affectedTemplateIds(catalog.templates, changedFiles, { fullCatalog: args.fullCatalog });
  console.log(JSON.stringify({ ids, count: ids.length, changedFiles }));
}
