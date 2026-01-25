import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "oidc-client-ts";
import { authManager, handleCallback, login, logout } from "./auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleCallback: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    authManager
      .getUser()
      .then((currentUser) => {
        if (!active) return;
        if (currentUser && isUserExpired(currentUser)) {
          authManager.removeUser().catch(() => undefined);
          setUser(null);
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load session.");
        setLoading(false);
      });

    const onUserLoaded = (loadedUser: User) => {
      if (isUserExpired(loadedUser)) {
        authManager.removeUser().catch(() => undefined);
        setUser(null);
        return;
      }
      setUser(loadedUser);
      setError(null);
    };
    const onUserUnloaded = () => setUser(null);
    const onAccessTokenExpired = () => {
      authManager.removeUser().catch(() => undefined);
      setUser(null);
    };

    authManager.events.addUserLoaded(onUserLoaded);
    authManager.events.addUserUnloaded(onUserUnloaded);
    authManager.events.addAccessTokenExpired(onAccessTokenExpired);

    return () => {
      active = false;
      authManager.events.removeUserLoaded(onUserLoaded);
      authManager.events.removeUserUnloaded(onUserUnloaded);
      authManager.events.removeAccessTokenExpired(onAccessTokenExpired);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login: async () => {
        setError(null);
        await login();
      },
      logout: async () => {
        setError(null);
        await logout();
      },
      handleCallback: async () => {
        setError(null);
        const signedInUser = await handleCallback();
        setUser(signedInUser);
        return signedInUser;
      },
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function isUserExpired(currentUser: User) {
  if (!currentUser.expires_at) return false;
  return currentUser.expires_at <= Math.floor(Date.now() / 1000);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
