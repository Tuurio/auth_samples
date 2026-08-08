import assert from "node:assert/strict";
import test from "node:test";
import { distributables, loadCatalog } from "./catalog.mjs";
import { affectedTemplateIds } from "./affected-templates.mjs";

const templates = distributables(loadCatalog());
const allReady = templates.filter((template) => template.status === "ready" && template.files).map((template) => template.id).sort();

test("selects only templates whose reviewed source changed", () => {
  assert.deepEqual(affectedTemplateIds(templates, ["auth_samples_react/src/App.tsx"]), ["react-vite"]);
  assert.deepEqual(
    affectedTemplateIds(templates, ["auth_samples_fastapi/app/main.py", "auth_samples_django/authapp/views.py"]),
    ["django", "fastapi"],
  );
});

test("selects the full catalog for shared package inputs and explicit full syncs", () => {
  assert.deepEqual(affectedTemplateIds(templates, ["distribution/README.template.md"]).sort(), allReady);
  assert.deepEqual(affectedTemplateIds(templates, [], { fullCatalog: true }).sort(), allReady);
});

test("does not sync satellites for distribution tooling that cannot change packages", () => {
  assert.deepEqual(affectedTemplateIds(templates, ["distribution/scripts/verify-template-repos.mjs"]), []);
  assert.deepEqual(affectedTemplateIds(templates, ["docs/vibe/AGENT_DIRECTORY_SUBMISSIONS.md"]), []);
});
