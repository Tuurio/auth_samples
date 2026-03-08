import type { AuthConfig } from "./auth.config";

export const generatedAuthConfig: AuthConfig = {
  authority: "https://test.id.tuurio.com",
  authorityHost: "test.id.tuurio.com",
  clientId: "spa-K53I",
  redirectUri: "http://localhost:4200/auth/callback",
  postLogoutRedirectUri: "http://localhost:4200/logout/callback",
  scope: "openid profile email",
};
