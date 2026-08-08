"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function HeroActions() {
  const { user, loading, configured, error, signIn } = useAuth();
  if (configured === false) return <div>
    <div className="hero-actions">
      <Link className="button" href="/demo">Explore the product demo</Link>
      <Link className="button secondary" href="/setup">Set up Tuurio ID</Link>
    </div>
    <p className="setup-hint">The demo stays in this browser. Connect your own Tuurio client when you are ready to use real identity.</p>
  </div>;
  return <div>
    <div className="hero-actions">
      {user ? <Link className="button" href="/workspace">Continue to workspace</Link> : (
        <button className="button" disabled={loading} onClick={() => void signIn()}>Start with Tuurio ID</button>
      )}
      <a className="button secondary" href="#product">See how it works</a>
    </div>
    {error && <p className="inline-error" role="alert">{error}</p>}
  </div>;
}
