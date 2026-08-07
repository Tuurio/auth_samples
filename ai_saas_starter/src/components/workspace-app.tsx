"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import type { Conversation, Message, UsageSnapshot } from "@/lib/domain";

interface RuntimeConfig { storageMode: "memory" | "postgres"; aiProvider: string }

async function readError(response: Response) {
  try { return (await response.json() as { error?: string }).error ?? `Request failed with HTTP ${response.status}`; }
  catch { return `Request failed with HTTP ${response.status}`; }
}

export function WorkspaceApp() {
  const { user, loading, error: authError, signIn, signOut, apiFetch } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [conversationResponse, usageResponse, configResponse] = await Promise.all([
        apiFetch("/api/conversations"), apiFetch("/api/usage"), fetch("/api/config"),
      ]);
      if (!conversationResponse.ok) throw new Error(await readError(conversationResponse));
      if (!usageResponse.ok) throw new Error(await readError(usageResponse));
      const conversationData = await conversationResponse.json() as { conversations: Conversation[] };
      setConversations(conversationData.conversations);
      setUsage((await usageResponse.json() as { usage: UsageSnapshot }).usage);
      setConfig(await configResponse.json() as RuntimeConfig);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load the workspace."); }
  }, [apiFetch, user]);

  useEffect(() => { void load(); }, [load]);

  async function openConversation(id: string) {
    setError(null);
    const response = await apiFetch(`/api/conversations/${id}`);
    if (!response.ok) return setError(await readError(response));
    setSelected((await response.json() as { conversation: Conversation }).conversation);
  }

  async function createConversation() {
    setError(null);
    const response = await apiFetch("/api/conversations", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Untitled exploration" }),
    });
    if (!response.ok) return setError(await readError(response));
    const conversation = (await response.json() as { conversation: Conversation }).conversation;
    setConversations((current) => [conversation, ...current]);
    setSelected({ ...conversation, messages: [] });
  }

  async function deleteConversation() {
    if (!selected || !window.confirm("Delete this conversation and its message history?")) return;
    const response = await apiFetch(`/api/conversations/${selected.id}`, { method: "DELETE" });
    if (!response.ok) return setError(await readError(response));
    setConversations((current) => current.filter((item) => item.id !== selected.id));
    setSelected(null);
  }

  async function sendMessage() {
    if (!selected || !prompt.trim() || streaming) return;
    const content = prompt.trim();
    setPrompt(""); setStreaming(true); setError(null);
    const optimisticUser: Message = { id: crypto.randomUUID(), tenantId: "", conversationId: selected.id, role: "user", content, createdAt: new Date().toISOString() };
    const optimisticAssistant: Message = { ...optimisticUser, id: crypto.randomUUID(), role: "assistant", content: "" };
    setSelected((current) => current ? { ...current, messages: [...(current.messages ?? []), optimisticUser, optimisticAssistant] } : current);
    try {
      const response = await apiFetch(`/api/conversations/${selected.id}/messages`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }),
      });
      if (!response.ok || !response.body) throw new Error(await readError(response));
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let complete = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        complete += decoder.decode(value, { stream: true });
        setSelected((current) => current ? { ...current, messages: (current.messages ?? []).map((message) => message.id === optimisticAssistant.id ? { ...message, content: complete } : message) } : current);
      }
      await load();
    } catch (caught) {
      setSelected((current) => current ? { ...current, messages: (current.messages ?? []).filter((message) => message.id !== optimisticAssistant.id) } : current);
      setError(caught instanceof Error ? caught.message : "The AI response failed.");
    } finally { setStreaming(false); }
  }

  const used = useMemo(() => usage ? usage.inputUnits + usage.outputUnits : 0, [usage]);
  if (loading) return <main className="centered-state"><p>Restoring your workspace…</p></main>;
  if (!user) return <main className="centered-state"><div className="empty-card"><span className="eyebrow">Protected workspace</span><h1>Sign in to continue</h1><p>{authError ?? "Use Tuurio ID to open an organization-scoped workspace."}</p><button className="button" onClick={() => void signIn()}>Sign in with Tuurio ID</button><Link href="/">Back home</Link></div></main>;

  return <main className="workspace-shell">
    <aside className="workspace-sidebar">
      <Link className="brand light" href="/"><span className="brand-mark">t</span><span>canvas</span></Link>
      <button className="new-chat" onClick={() => void createConversation()}>＋ New conversation</button>
      <div className="conversation-list" aria-label="Conversations">
        {conversations.length === 0 && <p className="muted">No conversations yet.</p>}
        {conversations.map((conversation) => <button className={selected?.id === conversation.id ? "active" : ""} key={conversation.id} onClick={() => void openConversation(conversation.id)}>{conversation.title}<small>{new Date(conversation.updatedAt).toLocaleDateString()}</small></button>)}
      </div>
      <div className="sidebar-footer"><Link href="/workspace/settings">Settings</Link><Link href="/workspace/admin">Admin</Link><button onClick={() => void signOut()}>Sign out</button></div>
    </aside>
    <section className="workspace-main">
      <header className="workspace-header"><div><span className="eyebrow">Organization workspace</span><h1>{selected?.title ?? "Start a useful conversation"}</h1></div><div className="account-pill">{String(user.profile.email ?? user.profile.sub)}<span>connected</span></div></header>
      {(config?.storageMode === "memory" || config?.aiProvider === "local-demo") && <div className="demo-banner"><strong>Evaluation mode</strong> {config.storageMode === "memory" ? "History resets when the server restarts. " : ""}{config.aiProvider === "local-demo" ? "Responses stay local and deterministic." : ""}</div>}
      {error && <div className="inline-error" role="alert">{error}</div>}
      {!selected ? <div className="workspace-empty"><div className="orb">✦</div><h2>Your next decision, made clearer.</h2><p>Create a conversation. Tuurio keeps the data boundary tied to the organization in your validated token.</p><button className="button" onClick={() => void createConversation()}>Create first conversation</button></div> : <>
        <div className="messages">
          {(selected.messages ?? []).length === 0 && <div className="workspace-empty compact-empty"><h2>What are you working through?</h2><p>Try a product decision, a customer synthesis, or a launch plan.</p></div>}
          {(selected.messages ?? []).map((message) => <article className={`message ${message.role}`} key={message.id}><span>{message.role === "user" ? "You" : "Canvas"}</span><p>{message.content || "Thinking…"}</p></article>)}
        </div>
        <div className="composer"><textarea aria-label="Message" maxLength={8_000} placeholder="Ask Canvas to help you think…" value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} /><button disabled={!prompt.trim() || streaming} onClick={() => void sendMessage()}>{streaming ? "…" : "↑"}</button><small>AI can be wrong. Keep a human in the decision.</small></div>
        <button className="danger-link" onClick={() => void deleteConversation()}>Delete conversation</button>
      </>}
      <div className="usage-line"><span>Monthly workspace usage</span><span>{used.toLocaleString()} / {usage?.limit.toLocaleString() ?? "—"} units</span></div>
    </section>
  </main>;
}
