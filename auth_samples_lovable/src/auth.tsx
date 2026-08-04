import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const required = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Run manage-tuurio-id init first.`);
  return value;
};

const manager = new UserManager({
  authority: required("VITE_TUURIO_ISSUER"),
  client_id: required("VITE_TUURIO_CLIENT_ID"),
  redirect_uri: required("VITE_TUURIO_REDIRECT_URI"),
  post_logout_redirect_uri: required("VITE_TUURIO_POST_LOGOUT_REDIRECT_URI"),
  response_type: "code",
  scope: import.meta.env.VITE_TUURIO_SCOPE || "openid profile email",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: false,
  monitorSession: false
});

// React StrictMode remounts effects in development; share each one-time OIDC callback across mounts.
let signinCallbackPromise: Promise<User> | null = null;
let signoutCallbackPromise: ReturnType<UserManager["signoutRedirectCallback"]> | null = null;

const completeSigninRedirect = (): Promise<User> => {
  signinCallbackPromise ??= manager.signinRedirectCallback();
  return signinCallbackPromise;
};

const completeSignoutRedirect = (): ReturnType<UserManager["signoutRedirectCallback"]> => {
  signoutCallbackPromise ??= manager.signoutRedirectCallback();
  return signoutCallbackPromise;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const handleAccessTokenExpired = () => {
      if (!active) return;
      setUser(null);
      void manager.removeUser().catch(() => undefined);
    };
    manager.events.addAccessTokenExpired(handleAccessTokenExpired);

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
          const current = await manager.getUser();
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
      manager.events.removeAccessTokenExpired(handleAccessTokenExpired);
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    error,
    login: () => manager.signinRedirect(),
    logout: () => manager.signoutRedirect({ id_token_hint: user?.id_token })
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
