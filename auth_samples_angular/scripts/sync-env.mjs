import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const defaults = {
  TUURIO_ISSUER: "https://test.id.tuurio.com",
  TUURIO_CLIENT_ID: "spa-K53I",
  TUURIO_REDIRECT_URI: "http://localhost:4200/auth/callback",
  TUURIO_POST_LOGOUT_REDIRECT_URI: "http://localhost:4200/logout/callback",
  TUURIO_SCOPE: "openid profile email",
};

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");
const outputPath = path.join(cwd, "src", "app", "auth", "auth.config.generated.ts");

const raw = await readFile(envPath, "utf8").catch(() => "");
const parsed = parseEnv(raw);

const authority = normalizeAuthority(parsed.TUURIO_ISSUER) ?? defaults.TUURIO_ISSUER;
const authorityHost = new URL(authority).host;
const clientId = sanitizeClientId(parsed.TUURIO_CLIENT_ID) ?? defaults.TUURIO_CLIENT_ID;
const redirectUri = normalizeHttpUrl(parsed.TUURIO_REDIRECT_URI) ?? defaults.TUURIO_REDIRECT_URI;
const postLogoutRedirectUri =
  normalizeHttpUrl(parsed.TUURIO_POST_LOGOUT_REDIRECT_URI) ??
  defaults.TUURIO_POST_LOGOUT_REDIRECT_URI;
const scope = sanitizeScope(parsed.TUURIO_SCOPE) ?? defaults.TUURIO_SCOPE;

const content = `import type { AuthConfig } from "./auth.config";\n\nexport const generatedAuthConfig: AuthConfig = {\n  authority: ${toTsString(authority)},\n  authorityHost: ${toTsString(authorityHost)},\n  clientId: ${toTsString(clientId)},\n  redirectUri: ${toTsString(redirectUri)},\n  postLogoutRedirectUri: ${toTsString(postLogoutRedirectUri)},\n  scope: ${toTsString(scope)},\n};\n`;

await writeFile(outputPath, content, "utf8");

function parseEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    values[key] = stripQuotes(value);
  }
  return values;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeAuthority(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return null;
  try {
    const parsedUrl = new URL(rawValue);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }
    parsedUrl.pathname = "/";
    parsedUrl.search = "";
    parsedUrl.hash = "";
    parsedUrl.username = "";
    parsedUrl.password = "";
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeHttpUrl(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return null;
  try {
    const parsedUrl = new URL(rawValue);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function sanitizeClientId(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return null;
  if (rawValue.length > 120) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(rawValue)) return null;
  return rawValue;
}

function sanitizeScope(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return null;
  const normalized = rawValue
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /^[A-Za-z0-9._:-]+$/.test(part))
    .join(" ");
  return normalized || null;
}

function toTsString(value) {
  return JSON.stringify(value);
}
