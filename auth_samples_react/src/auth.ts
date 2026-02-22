import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const DEFAULT_AUTHORITY = "https://test.id.tuurio.com";
const DEFAULT_CLIENT_ID = "spa-K53I";
const DEFAULT_SCOPE = "openid profile email";
const RUNTIME_CONFIG_STORAGE_KEY = "auth_samples_react:runtime-config";

type RuntimeAuthConfig = {
  authority: string;
  authorityHost: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
};

export const runtimeAuthConfig = resolveRuntimeAuthConfig();

let userInfoEndpoint: string | null = null;

async function getUserInfoEndpoint() {
  if (userInfoEndpoint) return userInfoEndpoint;
  const response = await fetch(`${runtimeAuthConfig.authority}/.well-known/openid-configuration`);
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

export const authManager = new UserManager({
  authority: runtimeAuthConfig.authority,
  client_id: runtimeAuthConfig.clientId,
  redirect_uri: runtimeAuthConfig.redirectUri,
  post_logout_redirect_uri: runtimeAuthConfig.postLogoutRedirectUri,
  response_type: "code",
  scope: runtimeAuthConfig.scope,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export const login = () => authManager.signinRedirect();
export const logout = () => authManager.signoutRedirect();
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

function buildRuntimeAppUrl(path: string) {
  const url = new URL(path, window.location.origin);
  return url.toString();
}

function resolveRuntimeAuthConfig(): RuntimeAuthConfig {
  const queryOverrides = readRuntimeConfigFromQuery();
  const storedOverrides = readRuntimeConfigFromSession();

  const authority =
    normalizeAuthority(queryOverrides.authority) ||
    normalizeAuthority(storedOverrides.authority) ||
    DEFAULT_AUTHORITY;
  const clientId =
    normalizeClientId(queryOverrides.clientId) ||
    normalizeClientId(storedOverrides.clientId) ||
    DEFAULT_CLIENT_ID;
  const scope =
    normalizeScope(queryOverrides.scope) ||
    normalizeScope(storedOverrides.scope) ||
    DEFAULT_SCOPE;

  const resolved: RuntimeAuthConfig = {
    authority,
    authorityHost: new URL(authority).host,
    clientId,
    scope,
    redirectUri: buildRuntimeAppUrl("/auth/callback"),
    postLogoutRedirectUri: buildRuntimeAppUrl("/"),
  };

  window.sessionStorage.setItem(
    RUNTIME_CONFIG_STORAGE_KEY,
    JSON.stringify({
      authority: resolved.authority,
      clientId: resolved.clientId,
      scope: resolved.scope,
    }),
  );
  return resolved;
}

function readRuntimeConfigFromQuery() {
  const search = new URLSearchParams(window.location.search);
  return {
    authority:
      normalizeAuthority(search.get("auth_server")) || normalizeAuthority(search.get("server_url")),
    clientId: normalizeClientId(search.get("client_id")) || normalizeClientId(search.get("clientId")),
    scope: normalizeScope(search.get("scope")),
  };
}

function readRuntimeConfigFromSession() {
  const raw = window.sessionStorage.getItem(RUNTIME_CONFIG_STORAGE_KEY);
  if (!raw) {
    return { authority: null, clientId: null, scope: null };
  }
  try {
    const parsed = JSON.parse(raw) as {
      authority?: string;
      clientId?: string;
      scope?: string;
    };
    return {
      authority: parsed.authority ?? null,
      clientId: parsed.clientId ?? null,
      scope: parsed.scope ?? null,
    };
  } catch {
    return { authority: null, clientId: null, scope: null };
  }
}

function normalizeAuthority(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  parsed.pathname = "/";
  parsed.search = "";
  parsed.hash = "";
  parsed.username = "";
  parsed.password = "";
  return parsed.toString().replace(/\/$/, "");
}

function normalizeClientId(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  if (raw.length > 120) {
    return null;
  }
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) {
    return null;
  }
  return raw;
}

function normalizeScope(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  const normalized = raw
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /^[A-Za-z0-9._:-]+$/.test(part))
    .join(" ");
  return normalized || null;
}
