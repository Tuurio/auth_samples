import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import publicConfigJson from "./tuurio.public.json";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

type PublicClientTarget = {
  role: "deployment" | "preview";
  deploymentBaseUrl: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
};

type PublicClientConfig = {
  version: 1;
  issuer: string;
  clientId: string;
  scope: string;
  targets: PublicClientTarget[];
};

const publicConfig = publicConfigJson as PublicClientConfig;

const runtimeTarget = (config: PublicClientConfig): PublicClientTarget => {
  if (config.version !== 1 || !config.issuer || !config.clientId || !Array.isArray(config.targets)) {
    throw new Error("Invalid Tuurio public-client configuration. Run manage-tuurio-id init first.");
  }

  const currentOrigin = window.location.origin;
  const matches = config.targets.filter((target) => {
    try {
      return new URL(target.deploymentBaseUrl).origin === currentOrigin;
    } catch {
      return false;
    }
  });
  if (matches.length !== 1) {
    throw new Error(`No unique Tuurio client target is registered for ${currentOrigin}. Re-run provisioning with this exact origin.`);
  }

  const target = matches[0];
  if (
    new URL(target.redirectUri).origin !== currentOrigin ||
    new URL(target.postLogoutRedirectUri).origin !== currentOrigin
  ) {
    throw new Error(`Tuurio callback URLs do not match the current origin ${currentOrigin}.`);
  }
  return target;
};

let manager: UserManager | null = null;
let configurationError: Error | null = null;
try {
  const selectedTarget = runtimeTarget(publicConfig);
  manager = new UserManager({
    authority: publicConfig.issuer,
    client_id: publicConfig.clientId,
    redirect_uri: selectedTarget.redirectUri,
    post_logout_redirect_uri: selectedTarget.postLogoutRedirectUri,
    response_type: "code",
    scope: publicConfig.scope || "openid profile email",
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    automaticSilentRenew: false,
    monitorSession: false
  });
} catch (cause) {
  configurationError = cause instanceof Error ? cause : new Error("Invalid Tuurio public-client configuration");
}

const requireManager = (): UserManager => {
  if (!manager) throw configurationError ?? new Error("Tuurio authentication is not configured");
  return manager;
};

// React StrictMode remounts effects in development; share each one-time OIDC callback across mounts.
let signinCallbackPromise: Promise<User> | null = null;
let signoutCallbackPromise: ReturnType<UserManager["signoutRedirectCallback"]> | null = null;

const completeSigninRedirect = (): Promise<User> => {
  signinCallbackPromise ??= requireManager().signinRedirectCallback();
  return signinCallbackPromise;
};

const completeSignoutRedirect = (): ReturnType<UserManager["signoutRedirectCallback"]> => {
  signoutCallbackPromise ??= requireManager().signoutRedirectCallback();
  return signoutCallbackPromise;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const oidc = manager;
    if (!oidc) {
      setError(configurationError?.message ?? "Tuurio authentication is not configured");
      setLoading(false);
      return () => { active = false; };
    }
    const handleAccessTokenExpired = () => {
      if (!active) return;
      setUser(null);
      void oidc.removeUser().catch(() => undefined);
    };
    oidc.events.addAccessTokenExpired(handleAccessTokenExpired);

    const initialize = async () => {
      try {
        if (window.location.pathname === "/auth/callback") {
          const callbackUser = await completeSigninRedirect();
          if (active) setUser(callbackUser);
          window.history.replaceState({}, document.title, "/");
        } else if (window.location.pathname === "/logout/callback") {
          await completeSignoutRedirect().catch(() => undefined);
          window.history.replaceState({}, document.title, "/");
        } else {
          const current = await oidc.getUser();
          if (active) setUser(current && !current.expired ? current : null);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Authentication failed");
      } finally {
        if (active) setLoading(false);
      }
    };
    void initialize();
    return () => {
      active = false;
      oidc.events.removeAccessTokenExpired(handleAccessTokenExpired);
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    error,
    login: () => requireManager().signinRedirect(),
    logout: () => requireManager().signoutRedirect({ id_token_hint: user?.id_token })
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
