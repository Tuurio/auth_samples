import { Injectable, signal } from "@angular/core";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import type { User } from "oidc-client-ts";
import { authConfig } from "./auth.config";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly manager = new UserManager({
    authority: authConfig.authority,
    client_id: authConfig.clientId,
    redirect_uri: authConfig.redirectUri,
    post_logout_redirect_uri: authConfig.postLogoutRedirectUri,
    response_type: "code",
    scope: authConfig.scope,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });

  readonly user = signal<User | null>(null);
  readonly profile = signal<Record<string, unknown> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private userInfoEndpoint: string | null = null;

  constructor() {
    this.bootstrap();
    this.registerEvents();
  }

  async login() {
    this.error.set(null);
    await this.manager.signinRedirect();
  }

  async logout() {
    this.error.set(null);
    await this.manager.signoutRedirect();
  }

  async handleCallback() {
    this.error.set(null);
    const signedInUser = await this.manager.signinRedirectCallback();
    this.user.set(signedInUser);
    if (signedInUser.access_token) {
      try {
        const info = await this.fetchUserInfo(signedInUser.access_token);
        this.profile.set(info);
      } catch {
        this.profile.set(null);
      }
    }
    return signedInUser;
  }

  private async bootstrap() {
    try {
      const currentUser = await this.manager.getUser();
      if (currentUser && this.isUserExpired(currentUser)) {
        await this.manager.removeUser();
        this.user.set(null);
        this.profile.set(null);
      } else {
        this.user.set(currentUser);
        if (currentUser?.access_token) {
          try {
            const info = await this.fetchUserInfo(currentUser.access_token);
            this.profile.set(info);
          } catch {
            this.profile.set(null);
          }
        }
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : "Failed to load session.");
    } finally {
      this.loading.set(false);
    }
  }

  private registerEvents() {
    this.manager.events.addUserLoaded((loadedUser) => {
      if (this.isUserExpired(loadedUser)) {
        this.manager.removeUser().catch(() => undefined);
        this.user.set(null);
        this.profile.set(null);
        return;
      }
      this.user.set(loadedUser);
      this.error.set(null);
      if (loadedUser.access_token) {
        this.fetchUserInfo(loadedUser.access_token)
          .then((info) => this.profile.set(info))
          .catch(() => this.profile.set(null));
      }
    });

    this.manager.events.addUserUnloaded(() => {
      this.user.set(null);
      this.profile.set(null);
    });

    this.manager.events.addAccessTokenExpired(() => {
      this.manager.removeUser().catch(() => undefined);
      this.user.set(null);
      this.profile.set(null);
    });
  }

  private async fetchUserInfo(accessToken: string) {
    const endpoint = await this.getUserInfoEndpoint();
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

  private async getUserInfoEndpoint() {
    if (this.userInfoEndpoint) return this.userInfoEndpoint;
    const response = await fetch(`${authConfig.authority}/.well-known/openid-configuration`);
    if (!response.ok) {
      throw new Error("Failed to load discovery document.");
    }
    const data = (await response.json()) as { userinfo_endpoint?: string };
    if (!data.userinfo_endpoint) {
      throw new Error("UserInfo endpoint not available.");
    }
    this.userInfoEndpoint = data.userinfo_endpoint;
    return this.userInfoEndpoint;
  }

  private isUserExpired(currentUser: User) {
    if (!currentUser.expires_at) return false;
    return currentUser.expires_at <= Math.floor(Date.now() / 1000);
  }
}
