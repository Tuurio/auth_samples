"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function SiteHeader() {
  const { user, loading, configured, signIn } = useAuth();
  return (
    <header className="site-header">
      <Link className="brand" href="/"><span className="brand-mark">t</span><span>tuurio canvas</span></Link>
      <nav aria-label="Primary navigation">
        <Link href="/pricing">Pricing</Link>
        <a href="https://id.tuurio.com/public/developers">Developers</a>
        {user ? <Link className="button compact" href="/workspace">Open workspace</Link> : configured === false ? (
          <Link className="button compact" href="/demo">View demo</Link>
        ) : (
          <button className="button compact" disabled={loading} onClick={() => void signIn()}>Sign in</button>
        )}
      </nav>
    </header>
  );
}
