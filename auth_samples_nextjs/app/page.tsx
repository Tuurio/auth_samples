"use client";

import { useMemo } from "react";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { Shell } from "../components/Shell";
import { Card } from "../components/Card";
import { LoadingState } from "../components/LoadingState";
import { LoginView } from "../components/LoginView";
import { TokenView } from "../components/TokenView";

function HomeContent() {
  const { user, profile, loading, error, login, logout } = useAuth();
  const status = useMemo(() => {
    if (loading) return { label: "Checking session", tone: "neutral" } as const;
    if (user) return { label: "Authenticated", tone: "good" } as const;
    return { label: "Signed out", tone: "neutral" } as const;
  }, [loading, user]);

  return (
    <Shell status={status}>
      {loading ? (
        <Card>
          <LoadingState title="Loading session" subtitle="Verifying tokens and session state." />
        </Card>
      ) : user ? (
        <TokenView user={user} profile={profile} onLogout={logout} />
      ) : (
        <LoginView onLogin={login} error={error} />
      )}
    </Shell>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
