import rawConfig from "@/tuurio.public.json";

export interface PublicTarget {
  role: string;
  deploymentBaseUrl: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
}

export interface PublicOidcConfig {
  version: number;
  issuer: string;
  clientId: string;
  scope: string;
  targets: PublicTarget[];
}

function exactOrigin(value: string, field: string): string {
  const url = new URL(value);
  if (url.origin !== value.replace(/\/$/, "")) throw new Error(`${field} must be an exact origin`);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error(`${field} must use HTTPS outside explicit loopback development`);
  }
  return url.origin;
}

function exactUrl(value: string, field: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error(`${field} must use HTTPS outside explicit loopback development`);
  }
  return url.toString();
}

export function validatePublicConfig(value: unknown = rawConfig): PublicOidcConfig {
  if (!value || typeof value !== "object") throw new Error("Tuurio public configuration is missing");
  const candidate = value as Partial<PublicOidcConfig>;
  if (candidate.version !== 1) throw new Error("Unsupported Tuurio public configuration version");
  if (!candidate.issuer || candidate.issuer.includes("replace-with")) throw new Error("Tuurio issuer is not provisioned");
  if (!candidate.clientId || candidate.clientId.includes("replace-")) throw new Error("Tuurio client ID is not provisioned");
  const issuer = exactUrl(candidate.issuer, "issuer").replace(/\/$/, "");
  if (!Array.isArray(candidate.targets)) throw new Error("Tuurio targets are missing");
  const targets = candidate.targets.map((target, index) => {
    const deploymentBaseUrl = exactOrigin(target.deploymentBaseUrl, `targets[${index}].deploymentBaseUrl`);
    const redirectUri = exactUrl(target.redirectUri, `targets[${index}].redirectUri`);
    const postLogoutRedirectUri = exactUrl(target.postLogoutRedirectUri, `targets[${index}].postLogoutRedirectUri`);
    if (new URL(redirectUri).origin !== deploymentBaseUrl || new URL(postLogoutRedirectUri).origin !== deploymentBaseUrl) {
      throw new Error(`targets[${index}] callbacks must belong to their exact deployment origin`);
    }
    return { role: target.role, deploymentBaseUrl, redirectUri, postLogoutRedirectUri };
  });
  return {
    version: 1,
    issuer,
    clientId: candidate.clientId,
    scope: candidate.scope || "openid profile email",
    targets,
  };
}

export function selectTarget(origin: string, value: unknown = rawConfig): PublicTarget {
  const config = validatePublicConfig(value);
  const normalized = exactOrigin(origin, "active origin");
  const matches = config.targets.filter((target) => target.deploymentBaseUrl === normalized);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one registered Tuurio target for ${normalized}; found ${matches.length}`);
  }
  return matches[0];
}
