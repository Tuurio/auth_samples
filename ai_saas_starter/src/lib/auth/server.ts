import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { z } from "zod";
import type { Identity } from "@/lib/domain";
import { validatePublicConfig } from "@/lib/auth/public-config";

const metadataSchema = z.object({
  issuer: z.string().url(),
  jwks_uri: z.string().url(),
});

const metadataCache = new Map<string, Promise<z.infer<typeof metadataSchema>>>();
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export class AuthFailure extends Error {
  constructor(message: string, readonly status = 401) {
    super(message);
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function identityFromClaims(payload: JWTPayload): Identity {
  if (!payload.iss || !payload.sub) throw new AuthFailure("Validated token is missing issuer or subject");
  const realm = payload.realm_access as { roles?: unknown } | undefined;
  const values = new Set([
    ...stringArray(payload.roles),
    ...stringArray(payload.permissions),
    ...stringArray(realm?.roles),
  ]);
  const role = values.has("admin") || values.has("org:tenant:write") || values.has("tenant:admin") ? "admin" : "member";
  return {
    tenantId: payload.iss,
    subject: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    role,
  };
}

async function discovery(issuer: string) {
  let pending = metadataCache.get(issuer);
  if (!pending) {
    pending = fetch(`${issuer}/.well-known/openid-configuration`, {
      headers: { accept: "application/json" },
      cache: "force-cache",
    }).then(async (response) => {
      if (!response.ok) throw new AuthFailure("OIDC discovery failed", 503);
      const metadata = metadataSchema.parse(await response.json());
      if (metadata.issuer !== issuer) throw new AuthFailure("OIDC discovery issuer mismatch", 503);
      if (new URL(metadata.jwks_uri).protocol !== "https:") throw new AuthFailure("OIDC JWKS must use HTTPS", 503);
      return metadata;
    });
    metadataCache.set(issuer, pending);
  }
  return pending;
}

async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const config = validatePublicConfig();
  const metadata = await discovery(config.issuer);
  let jwks = jwksCache.get(metadata.jwks_uri);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
    jwksCache.set(metadata.jwks_uri, jwks);
  }
  const result = await jwtVerify(token, jwks, {
    issuer: config.issuer,
    audience: config.clientId,
    algorithms: ["RS256", "ES256"],
  });
  return result.payload;
}

export async function authenticateRequest(request: Request): Promise<Identity> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([A-Za-z0-9._~-]+)$/);
  if (!match || match[1].length > 16_384) throw new AuthFailure("A valid bearer token is required");
  try {
    return identityFromClaims(await verifyAccessToken(match[1]));
  } catch (error) {
    if (error instanceof AuthFailure) throw error;
    throw new AuthFailure("Bearer token validation failed");
  }
}
