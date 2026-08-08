function exactOrigin(value: string): string {
  const url = new URL(value);
  if (url.origin !== value.replace(/\/$/, "")) throw new Error("Setup URL must be an exact origin");
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("Setup URL must use HTTPS outside explicit loopback development");
  }
  return url.origin;
}

export function buildProvisioningCommand(origin: string): string {
  const baseUrl = exactOrigin(origin);
  return [
    "npx manage-tuurio-id@1.1.6 init",
    "--framework nextjs",
    "--project-dir .",
    `--base-url ${baseUrl}`,
    `--redirect-uri ${baseUrl}/auth/callback`,
    `--post-logout-redirect-uri ${baseUrl}/logout/callback`,
    "--public-config src/tuurio.public.json",
    "--auth browser",
    "--yes",
    "--output json",
    "--campaign github_ai_saas",
    "--no-open",
    "--no-wait",
  ].join(" ");
}
