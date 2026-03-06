import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const DEFAULT_AUTHORITY = "https://test.id.tuurio.com";
const DEFAULT_CLIENT_ID = "spa-K53I";
const DEFAULT_SCOPE = "openid profile email";
const DEFAULT_REDIRECT_URI = "http://localhost:5173/auth/callback";
const DEFAULT_POST_LOGOUT_REDIRECT_URI = "http://localhost:5173/";

export type AuthConfig = {
  authority: string;
  authorityHost: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
};

export const authConfig: AuthConfig = resolveAuthConfig();
type DiscoveryDocument = {
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
};
let discoveryDocument: DiscoveryDocument | null = null;
let userInfoEndpoint: string | null = null;
let endSessionEndpoint: string | null = null;

async function getUserInfoEndpoint() {
  if (userInfoEndpoint) return userInfoEndpoint;
  const data = await getDiscoveryDocument();
  if (!data.userinfo_endpoint) {
    throw new Error("UserInfo endpoint not available.");
  }
  userInfoEndpoint = data.userinfo_endpoint;
  return userInfoEndpoint;
}

async function getEndSessionEndpoint() {
  if (endSessionEndpoint) return endSessionEndpoint;
  const data = await getDiscoveryDocument();
  if (!data.end_session_endpoint) {
    throw new Error("End-session endpoint not available.");
  }
  endSessionEndpoint = data.end_session_endpoint;
  return endSessionEndpoint;
}

async function getDiscoveryDocument() {
  if (discoveryDocument) {
    return discoveryDocument;
  }
  const response = await fetch(`${authConfig.authority}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new Error("Failed to load discovery document.");
  }
  const data = (await response.json()) as DiscoveryDocument;
  discoveryDocument = data;
  return data;
}

export const authManager = new UserManager({
  authority: authConfig.authority,
  client_id: authConfig.clientId,
  redirect_uri: authConfig.redirectUri,
  post_logout_redirect_uri: authConfig.postLogoutRedirectUri,
  response_type: "code",
  scope: authConfig.scope,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export const login = () => authManager.signinRedirect();
export async function logout() {
  await authManager.removeUser().catch(() => undefined);
  const logoutEndpoint = await getEndSessionEndpoint();
  if (typeof window === "undefined") {
    throw new Error("Logout redirect requires a browser environment.");
  }
  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    post_logout_redirect_uri: authConfig.postLogoutRedirectUri,
    state: createLogoutState(),
  });
  window.location.assign(`${logoutEndpoint}?${params.toString()}`);
}
export const handleCallback = () => authManager.signinRedirectCallback();

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

function resolveAuthConfig(): AuthConfig {
  const authority = normalizeAuthority(import.meta.env.VITE_TUURIO_ISSUER) ?? DEFAULT_AUTHORITY;
  const clientId = normalizeClientId(import.meta.env.VITE_TUURIO_CLIENT_ID) ?? DEFAULT_CLIENT_ID;
  const redirectUri = normalizeUrl(import.meta.env.VITE_TUURIO_REDIRECT_URI) ?? DEFAULT_REDIRECT_URI;
  const postLogoutRedirectUri =
    normalizeUrl(import.meta.env.VITE_TUURIO_POST_LOGOUT_REDIRECT_URI) ??
    DEFAULT_POST_LOGOUT_REDIRECT_URI;
  const scope = normalizeScope(import.meta.env.VITE_TUURIO_SCOPE) ?? DEFAULT_SCOPE;

  return {
    authority,
    authorityHost: new URL(authority).host,
    clientId,
    redirectUri,
    postLogoutRedirectUri,
    scope,
  };
}

function normalizeAuthority(value: string | null) {
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

function normalizeUrl(value: string | null) {
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

function normalizeClientId(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.length > 120) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) return null;
  return raw;
}

function normalizeScope(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /^[A-Za-z0-9._:-]+$/.test(part))
    .join(" ");
  return normalized || null;
}

function createLogoutState() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}`;
}
