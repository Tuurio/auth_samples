import { createHash } from "node:crypto";
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadCatalog, parseCommonArgs, repositoryRoot, selectDistributables } from "./catalog.mjs";

export const CLI_VERSION = "1.1.6";
const FORBIDDEN_NAMES = new Set([
  ".git",
  ".idea",
  ".next",
  ".gradle",
  "build",
  "dist",
  "node_modules",
  "local.properties",
]);
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(?:\..+)?$/,
  /\.(?:key|pem|p12|pfx)$/i,
  /^(?:id_rsa|id_ed25519)$/,
  /^\.DS_Store$/,
];
const SAFE_ENV_TEMPLATES = new Set([".env.example", ".env.sample", ".env.template"]);

function isInside(parent, candidate) {
  const path = relative(parent, candidate);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

function assertSafeRelativePath(value, field) {
  if (typeof value !== "string" || !value || isAbsolute(value) || value.split(/[\\/]/).includes("..")) {
    throw new Error(`${field} must be a safe relative path: ${String(value)}`);
  }
}

function isForbidden(path) {
  const name = basename(path);
  if (SAFE_ENV_TEMPLATES.has(name)) return false;
  return FORBIDDEN_NAMES.has(name) || FORBIDDEN_FILE_PATTERNS.some((pattern) => pattern.test(name));
}

function copyReviewedTree(source, destination, trackedFiles) {
  if (isForbidden(source)) return;
  const metadata = lstatSync(source);
  if (metadata.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in template packages: ${source}`);
  if (metadata.isDirectory()) {
    for (const name of readdirSync(source).sort()) {
      copyReviewedTree(resolve(source, name), resolve(destination, name), trackedFiles);
    }
    return;
  }
  if (!metadata.isFile()) throw new Error(`Unsupported source entry: ${source}`);
  if (!trackedFiles.has(resolve(source))) return;
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function trackedSourceFiles(root, sourceRoot) {
  const sourcePath = relative(root, sourceRoot);
  const output = execFileSync("git", ["ls-files", "-z", "--", sourcePath], {
    cwd: root,
    encoding: "utf8",
  });
  return new Set(output.split("\0").filter(Boolean).map((path) => resolve(root, path)));
}

function render(template, values) {
  return template.replace(/\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g, (_match, key) => {
    if (!(key in values)) throw new Error(`Missing README template value: ${key}`);
    return String(values[key]);
  });
}

function generatedWorkflow(template) {
  const commands = template.verify.map((command) => `          ${command}`).join("\n");
  const setups = {
    npm: `      - uses: actions/setup-node@395ad3262231945c25e8478fd5baf05154b1d79f # v6.1.0
        with:
          node-version: ${template.nodeVersion ?? 20}
          cache: npm
`,
    "Gradle Wrapper": "      - uses: actions/setup-java@cf277c60eb25467037889841efdb72551f06f6c3 # v4\n        with:\n          distribution: temurin\n          java-version: 17\n          cache: gradle\n",
    pip: "      - uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065 # v5\n        with:\n          python-version: '3.11'\n          cache: pip\n",
    "Go modules": "      - uses: actions/setup-go@40f1582b2485089dde7abd97c1529aa768e1baff # v5\n        with:\n          go-version-file: go.mod\n          cache: true\n",
    "Flutter pub": "      - uses: subosito/flutter-action@1a449444c387b1966244ae4d4f8c696479add0b2 # v2\n        with:\n          channel: stable\n          cache: true\n",
    Composer: "      - uses: shivammathur/setup-php@bf6b4fbd49ca58e4608c9c89fba0b8d90bd2a39f # 2.35.5\n        with:\n          php-version: '8.3'\n          tools: composer:v2\n          coverage: none\n",
  };
  const setup = setups[template.packageManager] ?? "";
  return `name: Verify template\n\non:\n  push:\n    branches: [main]\n  pull_request:\n\npermissions:\n  contents: read\n\njobs:\n  verify:\n    runs-on: ${template.runner ?? "ubuntu-latest"}\n    timeout-minutes: 20\n    steps:\n      - uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6\n${setup}      - name: Run template verification\n        run: |\n${commands}\n`;
}

function quickstartCommand(template) {
  return [
    `npx manage-tuurio-id@${CLI_VERSION} init`,
    `--framework ${template.framework}`,
    "--project-dir .",
    "--auth browser",
    "--yes",
    "--output json",
    `--campaign ${template.campaign}`,
    "--no-open",
    "--no-wait",
  ].join(" ");
}

function listFiles(root, current = root) {
  const results = [];
  for (const name of readdirSync(current).sort()) {
    const absolute = resolve(current, name);
    const metadata = lstatSync(absolute);
    if (metadata.isDirectory()) results.push(...listFiles(root, absolute));
    else if (metadata.isFile()) results.push(relative(root, absolute).split(sep).join("/"));
  }
  return results;
}

function checksum(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function packageChecksum(managedFiles) {
  const digest = createHash("sha256");
  for (const entry of managedFiles) {
    digest.update(entry.path);
    digest.update("\0");
    digest.update(entry.sha256);
    digest.update("\n");
  }
  return digest.digest("hex");
}

export function resolveSourceSha(root = repositoryRoot) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

export function packageTemplate(template, { root = repositoryRoot, output, sourceSha = resolveSourceSha(root) }) {
  if (!output) throw new Error("An output directory is required");
  if (!Array.isArray(template.files) || template.files.length === 0) {
    throw new Error(`${template.id}: files allow-list is required before packaging`);
  }
  for (const field of ["framework", "runtime", "packageManager"]) {
    if (!template[field]) throw new Error(`${template.id}: ${field} is required before packaging`);
  }
  const outputPath = resolve(output);
  const sourceRoot = resolve(root, template.source);
  if (!isInside(root, sourceRoot) || sourceRoot === root) throw new Error(`${template.id}: source escapes repository root`);
  if (!statSync(sourceRoot).isDirectory()) throw new Error(`${template.id}: source directory not found`);
  if (isInside(sourceRoot, outputPath) || isInside(outputPath, sourceRoot) || outputPath === resolve(root)) {
    throw new Error("Output must be isolated from the repository and selected source directory");
  }
  rmSync(outputPath, { recursive: true, force: true });
  mkdirSync(outputPath, { recursive: true });
  const trackedFiles = trackedSourceFiles(root, sourceRoot);

  for (const entry of template.files) {
    assertSafeRelativePath(entry, `${template.id}.files`);
    const source = resolve(sourceRoot, entry);
    if (!isInside(sourceRoot, source)) throw new Error(`${template.id}: allow-listed path escapes source`);
    const metadata = statSync(source);
    if (!metadata.isFile() && !metadata.isDirectory()) throw new Error(`${template.id}: invalid source entry ${entry}`);
    copyReviewedTree(source, resolve(outputPath, entry), trackedFiles);
  }

  copyFileSync(resolve(root, "LICENSE"), resolve(outputPath, "LICENSE"));
  const sourceReadme = readFileSync(resolve(sourceRoot, "README.md"), "utf8");
  const readmeTemplate = readFileSync(resolve(root, "distribution/README.template.md"), "utf8");
  writeFileSync(
    resolve(outputPath, "README.md"),
    render(readmeTemplate, {
      displayName: template.displayName,
      description: template.description,
      repository: template.repository,
      source: template.source,
      quickstartCommand: quickstartCommand(template),
      runtime: template.runtime,
      packageManager: template.packageManager,
      verifySummary: template.verify.join(" && "),
      sourceReadme,
    }),
  );
  writeFileSync(
    resolve(outputPath, "CONTRIBUTING.md"),
    `# Contributing\n\nThis repository is generated from https://github.com/Tuurio/auth_samples/tree/main/${template.source}.\n\nOpen implementation changes in the source repository. Direct changes here may be replaced by a later synchronized commit.\n`,
  );
  mkdirSync(resolve(outputPath, ".github/workflows"), { recursive: true });
  writeFileSync(resolve(outputPath, ".github/workflows/verify.yml"), generatedWorkflow(template));
  if (template.stackblitz && template.start) {
    writeFileSync(resolve(outputPath, ".stackblitzrc"), `${JSON.stringify({ startCommand: template.start }, null, 2)}\n`);
  }

  const managedFiles = listFiles(outputPath).map((path) => ({
    path,
    sha256: checksum(resolve(outputPath, path)),
  }));
  const marker = {
    schemaVersion: 2,
    sourceRepository: "Tuurio/auth_samples",
    sourcePath: template.source,
    sourceSha,
    packageSha256: packageChecksum(managedFiles),
    templateId: template.id,
    managedFiles,
  };
  writeFileSync(resolve(outputPath, ".tuurio-template.json"), `${JSON.stringify(marker, null, 2)}\n`);
  return { outputPath, marker };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = parseCommonArgs(process.argv.slice(2));
  if (!args.output) throw new Error("--output is required");
  const manifest = loadCatalog();
  const templates = selectDistributables(manifest, args.ids);
  if (templates.length !== 1) throw new Error("Select exactly one template with --id");
  const result = packageTemplate(templates[0], { output: args.output });
  console.log(JSON.stringify({ template: templates[0].id, output: result.outputPath, files: result.marker.managedFiles.length }));
}
