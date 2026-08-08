"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <main className="centered-state">Loading…</main>;
  return <main className="settings-page"><Link href="/workspace">← Workspace</Link><span className="eyebrow">Profile & organization</span><h1>Workspace settings</h1>{user ? <div className="settings-grid"><article><span>Email</span><strong>{String(user.profile.email ?? "Not provided")}</strong></article><article><span>Issuer</span><strong>{String(user.profile.iss ?? "Not provided")}</strong></article><article><span>Data retention</span><strong>Delete conversations from the workspace at any time.</strong></article><article><span>Session</span><button className="button secondary" onClick={() => void signOut()}>Sign out completely</button></article></div> : <p>Sign in to view settings.</p>}</main>;
}
