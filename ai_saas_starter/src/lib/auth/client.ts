"use client";

import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import { selectTarget, validatePublicConfig } from "@/lib/auth/public-config";

let manager: UserManager | null = null;
let callbackPromise: Promise<User> | null = null;
let logoutPromise: Promise<void> | null = null;

export function authManager(): UserManager {
  if (typeof window === "undefined") throw new Error("Tuurio browser auth is unavailable during server rendering");
  if (!manager) {
    const config = validatePublicConfig();
    const target = selectTarget(window.location.origin);
    manager = new UserManager({
      authority: config.issuer,
      client_id: config.clientId,
      redirect_uri: target.redirectUri,
      post_logout_redirect_uri: target.postLogoutRedirectUri,
      response_type: "code",
      scope: config.scope,
      automaticSilentRenew: false,
      monitorSession: false,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });
  }
  return manager;
}

export function completeSigninOnce(): Promise<User> {
  callbackPromise ??= authManager().signinRedirectCallback();
  return callbackPromise;
}

export function completeSignoutOnce(): Promise<void> {
  logoutPromise ??= authManager().signoutRedirectCallback().then(() => undefined);
  return logoutPromise;
}
