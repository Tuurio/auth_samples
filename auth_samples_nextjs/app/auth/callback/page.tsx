"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "../../../providers/AuthProvider";
import { Shell } from "../../../components/Shell";
import { Card } from "../../../components/Card";
import { LoadingState } from "../../../components/LoadingState";

function CallbackContent() {
  const router = useRouter();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    handleCallback()
      .then(() => {
        router.replace("/");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Login failed.");
      });
  }, [handleCallback, router]);

  return (
    <Shell status={{ label: "Finalizing login", tone: "neutral" }}>
      <Card>
        {error ? (
          <div className="stack">
            <div className="status status-bad">Authentication error</div>
            <h2 className="card-title">We couldn't finish signing you in.</h2>
            <p className="muted">{error}</p>
            <button className="button ghost" onClick={() => router.replace("/")}>
              Back to login
            </button>
          </div>
        ) : (
          <LoadingState title="Completing sign-in" subtitle="Processing the authorization response." />
        )}
      </Card>
    </Shell>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthProvider>
      <CallbackContent />
    </AuthProvider>
  );
}
