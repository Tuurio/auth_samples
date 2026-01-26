import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const authConfig = {
  authority: "https://test.id.tuurio.com",
  clientId: "spa-K53I",
  redirectUri: "http://localhost:3000/auth/callback",
  postLogoutRedirectUri: "http://localhost:3000/",
  scope: "openid profile email",
};

let manager: UserManager | null = null;

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

export function getAuthManager() {
  return getManager();
}
