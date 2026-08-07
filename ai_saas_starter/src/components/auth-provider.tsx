"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "oidc-client-ts";
import { authManager } from "@/lib/auth/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const manager = authManager();
      const clear = () => { if (active) setUser(null); };
      manager.events.addUserUnloaded(clear);
      manager.events.addAccessTokenExpired(clear);
      manager.getUser().then((current) => {
        if (!active) return;
        setUser(current && !current.expired ? current : null);
      }).catch(() => active && setError("Could not restore the Tuurio session.")).finally(() => active && setLoading(false));
      return () => {
        active = false;
        manager.events.removeUserUnloaded(clear);
        manager.events.removeAccessTokenExpired(clear);
      };
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tuurio is not configured for this origin.");
      setLoading(false);
      return () => { active = false; };
    }
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    await authManager().signinRedirect({ state: { returnTo: "/workspace" } });
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const manager = authManager();
    const current = await manager.getUser();
    await manager.signoutRedirect({ id_token_hint: current?.id_token });
  }, []);

  const apiFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const current = await authManager().getUser();
    if (!current || current.expired) throw new Error("Your session expired. Sign in again.");
    const headers = new Headers(init.headers);
    headers.set("authorization", `Bearer ${current.access_token}`);
    return fetch(input, { ...init, headers });
  }, []);

  const value = useMemo(() => ({ user, loading, error, signIn, signOut, apiFetch }), [user, loading, error, signIn, signOut, apiFetch]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
