import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const authority = "https://test.id.tuurio.com";
const clientId = "spa-K53I";
const redirectUri = "http://localhost:5173/auth/callback";
const postLogoutRedirectUri = "http://localhost:5173/";

let userInfoEndpoint: string | null = null;

async function getUserInfoEndpoint() {
  if (userInfoEndpoint) return userInfoEndpoint;
  const response = await fetch(`${authority}/.well-known/openid-configuration`);
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
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  response_type: "code",
  scope: "openid profile email",
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
