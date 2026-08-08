import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { loadCatalog } from "./catalog.mjs";
import { packageTemplate } from "./package-template.mjs";
import { assertNoUnmanagedCollisions, copyPackageContents, removeManagedFiles } from "./sync-template-repos.mjs";
import { compareMarkers } from "./verify-template-repos.mjs";

const manifest = loadCatalog();
const aiSaas = manifest.products.find((product) => product.id === "ai-saas");
const react = manifest.templates.find((template) => template.id === "react-vite");
const laravel = manifest.templates.find((template) => template.id === "laravel");
const repositoryRoot = resolve(import.meta.dirname, "../..");
const sliceFourSecurityFiles = new Map([
  ["sveltekit", ["src/lib/server/oidc.ts"]],
  ["nuxt", ["server/utils/tuurio-oidc.ts"]],
  ["astro", ["src/lib/server/oidc.ts"]],
  ["react-router", ["server/oidc.ts"]],
  ["django", ["authapp/oauth.py", "authapp/views.py"]],
  ["fastapi", ["app/main.py"]],
]);

test("packages the React pilot deterministically from an allow-list", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-package-test-"));
  try {
    const first = resolve(temporary, "first");
    const second = resolve(temporary, "second");
    const sourceSha = "a".repeat(40);
    const firstResult = packageTemplate(react, { output: first, sourceSha });
    const secondResult = packageTemplate(react, { output: second, sourceSha });
    assert.deepEqual(firstResult.marker, secondResult.marker);
    assert.equal(firstResult.marker.schemaVersion, 2);
    assert.equal(firstResult.marker.sourceSha, sourceSha);
    assert.match(firstResult.marker.packageSha256, /^[a-f0-9]{64}$/);
    assert.ok(firstResult.marker.managedFiles.some((entry) => entry.path === "LICENSE"));
    assert.ok(firstResult.marker.managedFiles.some((entry) => entry.path === "package-lock.json"));
    assert.ok(!firstResult.marker.managedFiles.some((entry) => entry.path === ".env"));
    assert.match(readFileSync(resolve(first, "README.md"), "utf8"), /manage-tuurio-id@1\.1\.6/);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("packages every ready template without shared credentials or raw-token guidance", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-package-catalog-test-"));
  try {
    const readyTemplates = manifest.templates.filter((template) => template.status === "ready");
    assert.equal(readyTemplates.length, 20);
    for (const template of readyTemplates) {
      const output = resolve(temporary, template.id);
      const result = packageTemplate(template, { output, sourceSha: "1".repeat(40) });
      assert.equal(result.marker.templateId, template.id);
      assert.ok(result.marker.managedFiles.length > 5, `${template.id} package is unexpectedly small`);

      const readable = result.marker.managedFiles
        .map((entry) => entry.path)
        .filter((path) => /(?:\.env\.example|\.gradle|\.java|\.js|\.json|\.kt|\.kts|\.md|\.mjs|\.php|\.properties|\.py|\.sh|\.swift|\.ts|\.tsx|\.vue|\.xml|\.ya?ml|^Dockerfile$|^gradlew$)/.test(path))
        .map((path) => readFileSync(resolve(output, path), "utf8"))
        .join("\n");
      assert.doesNotMatch(readable, /spa-K53I|php-KQD8/);
      assert.doesNotMatch(readable, /Access token and ID token \(raw|Raw JWT/i);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("packages the AI SaaS product separately from the twenty framework satellites", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-ai-saas-product-test-"));
  try {
    assert.equal(manifest.templates.length, 20);
    assert.equal(manifest.products.length, 1);
    const output = resolve(temporary, "product");
    const result = packageTemplate(aiSaas, { output, sourceSha: "6".repeat(40) });
    assert.equal(result.marker.templateId, "ai-saas");
    assert.ok(result.marker.managedFiles.some((entry) => entry.path === "db/schema.sql"));
    assert.ok(result.marker.managedFiles.some((entry) => entry.path === "src/tuurio.public.json"));
    assert.doesNotMatch(readFileSync(resolve(output, "src/tuurio.public.json"), "utf8"), /clientSecret/);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("packages the six server starters with the reviewed authentication contract", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-package-server-contract-test-"));
  try {
    for (const [templateId, securityFiles] of sliceFourSecurityFiles) {
      const template = manifest.templates.find((candidate) => candidate.id === templateId);
      const output = resolve(temporary, templateId);
      packageTemplate(template, { output, sourceSha: "3".repeat(40) });
      const implementation = securityFiles.map((path) => readFileSync(resolve(output, path), "utf8")).join("\n");
      assert.match(implementation, /S256|code_challenge_method/i, `${templateId} must require PKCE S256`);
      assert.match(implementation, /userinfo/i, `${templateId} must bind UserInfo to the validated subject`);
      assert.match(implementation, /post_logout_redirect_uri/i, `${templateId} must implement RP-initiated logout`);
      assert.doesNotMatch(implementation, /localStorage|sessionStorage/, `${templateId} must keep tokens server-side`);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("excludes ignored framework caches from managed template files", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-package-cache-test-"));
  try {
    const result = packageTemplate(laravel, {
      output: resolve(temporary, "laravel"),
      sourceSha: "2".repeat(40),
    });
    const managed = result.marker.managedFiles.map((entry) => entry.path);
    assert.ok(managed.includes("bootstrap/cache/.gitignore"));
    assert.ok(managed.includes("storage/framework/views/.gitignore"));
    assert.ok(!managed.includes("bootstrap/cache/packages.php"));
    assert.ok(!managed.some((path) => path.startsWith("storage/framework/views/") && path.endsWith(".php")));
    assert.ok(!managed.includes("storage/logs/laravel.log"));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("rejects symbolic links in reviewed package inputs", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-package-link-test-"));
  try {
    const sourcePath = resolve(repositoryRoot, "auth_samples_react", "unsafe-test-link");
    symlinkSync("README.md", sourcePath);
    const candidate = { ...react, files: [...react.files, "unsafe-test-link"] };
    assert.throws(() => packageTemplate(candidate, {
      output: resolve(temporary, "output"),
      sourceSha: "b".repeat(40),
    }), /Symbolic links are not allowed/);
    rmSync(sourcePath, { force: true });
  } finally {
    rmSync(resolve(repositoryRoot, "auth_samples_react", "unsafe-test-link"), { force: true });
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("sync replaces only previously managed files and preserves unmanaged files", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-sync-test-"));
  try {
    const first = resolve(temporary, "first");
    const second = resolve(temporary, "second");
    const clone = resolve(temporary, "clone");
    mkdirSync(clone);
    const firstResult = packageTemplate(react, { output: first, sourceSha: "c".repeat(40) });
    copyPackageContents(first, clone);
    writeFileSync(resolve(clone, "OWNER-NOTES.md"), "preserve me\n");
    const secondResult = packageTemplate(react, { output: second, sourceSha: "d".repeat(40) });
    removeManagedFiles(clone, firstResult.marker);
    copyPackageContents(second, clone);
    assert.equal(readFileSync(resolve(clone, "OWNER-NOTES.md"), "utf8"), "preserve me\n");
    assert.equal(JSON.parse(readFileSync(resolve(clone, ".tuurio-template.json"), "utf8")).sourceSha, "d".repeat(40));
    assert.deepEqual(compareMarkers(secondResult.marker, secondResult.marker), []);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("sync rejects unsafe paths from a tampered management marker", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-sync-path-test-"));
  try {
    const outside = resolve(temporary, "outside.txt");
    const clone = resolve(temporary, "clone");
    mkdirSync(clone);
    writeFileSync(outside, "keep\n");
    assert.throws(() => removeManagedFiles(clone, {
      sourceRepository: "Tuurio/auth_samples",
      managedFiles: [{ path: "../outside.txt", sha256: "unused" }],
    }), /Unsafe managed path/);
    assert.equal(existsSync(outside), true);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("sync refuses to overwrite files that are not owned by the management marker", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "tuurio-sync-collision-test-"));
  try {
    const packaged = resolve(temporary, "packaged");
    const clone = resolve(temporary, "clone");
    mkdirSync(packaged);
    mkdirSync(clone);
    writeFileSync(resolve(packaged, "README.md"), "generated\n");
    writeFileSync(resolve(clone, "README.md"), "maintainer-owned\n");
    assert.throws(() => assertNoUnmanagedCollisions(packaged, clone), /overwrite an unmanaged file/);
    assert.equal(readFileSync(resolve(clone, "README.md"), "utf8"), "maintainer-owned\n");
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("remote verification detects package drift without coupling to unrelated source commits", () => {
  const base = {
    schemaVersion: 2,
    sourceRepository: "Tuurio/auth_samples",
    sourcePath: "auth_samples_react",
    sourceSha: "e".repeat(40),
    packageSha256: "a".repeat(64),
    templateId: "react-vite",
    managedFiles: [{ path: "README.md", sha256: "one" }],
  };
  assert.deepEqual(compareMarkers(base, base), []);
  assert.deepEqual(compareMarkers({ ...base, sourceSha: "f".repeat(40) }, base), []);
  assert.deepEqual(compareMarkers({ ...base, sourceSha: "not-a-commit" }, base), [
    "marker sourceSha is not a full Git commit",
  ]);
  const drifted = {
    ...base,
    packageSha256: "b".repeat(64),
    managedFiles: [...base.managedFiles, { path: "unexpected.txt", sha256: "two" }],
  };
  assert.deepEqual(compareMarkers(drifted, base), [
    "marker packageSha256 mismatch",
    "marker has unexpected managed file unexpected.txt",
  ]);
});
