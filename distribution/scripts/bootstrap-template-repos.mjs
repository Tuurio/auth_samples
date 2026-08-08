import process from "node:process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { loadCatalog, parseCommonArgs, selectDistributables } from "./catalog.mjs";
import { repositoryExists, run } from "./github.mjs";

function expectedMetadata(template) {
  return {
    description: template.description,
    homepage: template.homepage,
    has_issues: true,
    has_projects: false,
    has_wiki: false,
    is_template: true,
  };
}

export function bootstrapTemplate(template, { apply = false } = {}) {
  const exists = repositoryExists(template.repository);
  const actions = [];
  if (!exists) {
    actions.push(`create public repository ${template.repository}`);
    if (apply) {
      run("gh", ["repo", "create", template.repository, "--public", "--description", template.description]);
    }
  }
  actions.push("set description, homepage, topics, and template-repository flag");
  if (apply) {
    const [owner, name] = template.repository.split("/");
    const metadata = expectedMetadata(template);
    run("gh", [
      "api", `repos/${owner}/${name}`, "--method", "PATCH",
      "-f", `description=${metadata.description}`,
      "-f", `homepage=${metadata.homepage}`,
      "-F", "has_issues=true",
      "-F", "has_projects=false",
      "-F", "has_wiki=false",
      "-F", "is_template=true",
    ]);
  }
  return { template: template.id, repository: template.repository, exists, apply, actions };
}

function setTopics(template) {
  const [owner, name] = template.repository.split("/");
  const args = ["api", `repos/${owner}/${name}/topics`, "--method", "PUT"];
  for (const topic of template.topics) args.push("-f", `names[]=${topic}`);
  run("gh", args);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const args = parseCommonArgs(process.argv.slice(2));
  const templates = selectDistributables(loadCatalog(), args.ids);
  const results = [];
  for (const template of templates) {
    if (!template.files) continue;
    const result = bootstrapTemplate(template, { apply: args.apply });
    if (args.apply) setTopics(template);
    results.push(result);
  }
  console.log(JSON.stringify(results, null, 2));
}
