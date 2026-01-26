import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const authConfig = {
  authority: "https://test.id.tuurio.com",
  clientId: "spa-K53I",
  redirectUri: "http://localhost:3000/auth/callback",
  postLogoutRedirectUri: "http://localhost:3000/",
  scope: "openid profile email",
};

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
