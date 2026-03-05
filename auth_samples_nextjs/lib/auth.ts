import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const DEFAULT_AUTHORITY = "https://test.id.tuurio.com";
const DEFAULT_CLIENT_ID = "spa-K53I";
const DEFAULT_REDIRECT_URI = "http://localhost:3000/auth/callback";
const DEFAULT_POST_LOGOUT_REDIRECT_URI = "http://localhost:3000/";
const DEFAULT_SCOPE = "openid profile email";

export const authConfig = {
  authority: normalizeAuthority(process.env.NEXT_PUBLIC_TUURIO_ISSUER) ?? DEFAULT_AUTHORITY,
  clientId: normalizeClientId(process.env.NEXT_PUBLIC_TUURIO_CLIENT_ID) ?? DEFAULT_CLIENT_ID,
  redirectUri:
    normalizeUrl(process.env.NEXT_PUBLIC_TUURIO_REDIRECT_URI) ?? DEFAULT_REDIRECT_URI,
  postLogoutRedirectUri:
    normalizeUrl(process.env.NEXT_PUBLIC_TUURIO_POST_LOGOUT_REDIRECT_URI) ??
    DEFAULT_POST_LOGOUT_REDIRECT_URI,
  scope: normalizeScope(process.env.NEXT_PUBLIC_TUURIO_SCOPE) ?? DEFAULT_SCOPE,
};
export const authAuthorityHost = new URL(authConfig.authority).host;

let manager: UserManager | null = null;
let userInfoEndpoint: string | null = null;

function getManager() {
  if (manager) return manager;
  if (typeof window === "undefined") return null;
  manager = new UserManager({
    authority: authConfig.authority,
    client_id: authConfig.clientId,
    redirect_uri: authConfig.redirectUri,
    post_logout_redirect_uri: authConfig.postLogoutRedirectUri,
    response_type: "code",
    scope: authConfig.scope,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });
  return manager;
}

export async function login() {
  const mgr = getManager();
  if (!mgr) throw new Error("Auth manager not available.");
  await mgr.signinRedirect();
}

export async function logout() {
  const mgr = getManager();
  if (!mgr) throw new Error("Auth manager not available.");
  await mgr.signoutRedirect();
}

export async function handleCallback() {
  const mgr = getManager();
  if (!mgr) throw new Error("Auth manager not available.");
  return await mgr.signinRedirectCallback();
}

export async function getUser() {
  const mgr = getManager();
  if (!mgr) throw new Error("Auth manager not available.");
  return await mgr.getUser();
}

async function getUserInfoEndpoint() {
  if (userInfoEndpoint) return userInfoEndpoint;
  const response = await fetch(`${authConfig.authority}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new Error("Failed to load discovery document.");
  }
  const data = (await response.json()) as { userinfo_endpoint?: string };
  if (!data.userinfo_endpoint) {
    throw new Error("UserInfo endpoint not available.");
  }
  userInfoEndpoint = data.userinfo_endpoint;
  return userInfoEndpoint;
}

export async function fetchUserInfo(accessToken: string) {
  const endpoint = await getUserInfoEndpoint();
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load user profile.");
  }
  return (await response.json()) as Record<string, unknown>;
}

export function getAuthManager() {
  return getManager();
}

function normalizeAuthority(value: string | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeUrl(value: string | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeClientId(value: string | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.length > 120) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) return null;
  return raw;
}

function normalizeScope(value: string | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /^[A-Za-z0-9._:-]+$/.test(part))
    .join(" ");
  return normalized || null;
}
