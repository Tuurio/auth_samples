import { generatedAuthConfig } from "./auth.config.generated";

export type AuthConfig = {
  authority: string;
  authorityHost: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
};

export const authConfig: AuthConfig = generatedAuthConfig;
