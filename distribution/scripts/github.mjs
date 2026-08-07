import { execFileSync, spawnSync } from "node:child_process";

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    stdio: options.capture === false ? "inherit" : "pipe",
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `:\n${detail}` : ""}`);
  }
  return (result.stdout ?? "").trim();
}

export function ghJson(args) {
  const output = run("gh", args);
  return output ? JSON.parse(output) : null;
}

export function repositoryExists(repository) {
  const result = spawnSync("gh", ["repo", "view", repository, "--json", "nameWithOwner"], {
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status === 0) return true;
  if (/Could not resolve to a Repository|not found/i.test(`${result.stdout}\n${result.stderr}`)) return false;
  throw new Error(`Unable to inspect ${repository}: ${(result.stderr || result.stdout).trim()}`);
}

export function sourceRepositorySha(root) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}
