"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function HeroActions() {
  const { user, loading, error, signIn } = useAuth();
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
