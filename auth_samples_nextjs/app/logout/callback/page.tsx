"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { Card } from "../../../components/Card";
import { handleLogoutCallback } from "../../../lib/auth";

export default function LogoutCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    handleLogoutCallback().catch((err) => {
      setError(err instanceof Error ? err.message : "Logout callback failed.");
    });
  }, [router]);

  return (
    <Shell status={{ label: error ? "Callback error" : "Signed out", tone: error ? "bad" : "neutral" }}>
      <Card>
        <div className="stack">
          <span className="eyebrow">Logout complete</span>
          <h1 className="card-title">
            {error ? "We couldn't finalize the logout callback." : "You have been signed out."}
          </h1>
          <p className="muted">
            {error
              ? error
              : "The browser session is cleared. Start a new login to inspect tokens again."}
          </p>
          <div className="button-row">
            <button className="button" onClick={() => router.replace("/")}>
              Return to demo
            </button>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
