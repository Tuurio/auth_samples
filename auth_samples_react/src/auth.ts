import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const authority = "https://test.id.tuurio.com";
const clientId = "spa-K53I";
const redirectUri = "http://localhost:5173/auth/callback";
const postLogoutRedirectUri = "http://localhost:5173/";

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
