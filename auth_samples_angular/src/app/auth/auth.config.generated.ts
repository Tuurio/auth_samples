import type { AuthConfig } from "./auth.config";

export const generatedAuthConfig: AuthConfig = {
  authority: "https://your-tenant.id.tuurio.com",
  authorityHost: "your-tenant.id.tuurio.com",
  clientId: "replace-after-browser-handoff",
  redirectUri: "http://localhost:4200/auth/callback",
  postLogoutRedirectUri: "http://localhost:4200/logout/callback",
  scope: "openid profile email",
};
