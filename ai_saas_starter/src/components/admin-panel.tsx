"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import type { AuditEvent } from "@/lib/domain";

export function AdminPanel() {
  const { user, loading, apiFetch, signIn } = useAuth();
  const [data, setData] = useState<{ audit: AuditEvent[]; membershipManagementUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (user) void apiFetch("/api/admin").then(async (response) => { if (!response.ok) throw new Error(response.status === 403 ? "Your validated token does not grant workspace administration." : "Could not load administration."); return response.json() as Promise<{ audit: AuditEvent[]; membershipManagementUrl: string }>; }).then(setData).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load administration.")); }, [apiFetch, user]);
  if (loading) return <main className="centered-state">Loading…</main>;
  if (!user) return <main className="centered-state"><button className="button" onClick={() => void signIn()}>Sign in</button></main>;
  return <main className="settings-page"><Link href="/workspace">← Workspace</Link><span className="eyebrow">Administration</span><h1>Security activity</h1><p>Membership and identity roles stay in Tuurio. Application audit events stay scoped to this organization.</p>{error && <div className="inline-error">{error}</div>}{data && <><a className="button secondary" href={data.membershipManagementUrl}>Manage identity in Tuurio</a><div className="audit-list">{data.audit.length ? data.audit.map((event) => <article key={event.id}><strong>{event.action}</strong><span>{new Date(event.createdAt).toLocaleString()}</span><code>{event.targetId ?? "workspace"}</code></article>) : <p>No application audit events yet.</p>}</div></>}</main>;
}
