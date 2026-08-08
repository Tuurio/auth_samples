"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DemoView = "chat" | "admin" | "settings";
type DemoMessage = { id: string; role: "user" | "assistant"; content: string };

const initialMessages: DemoMessage[] = [
  { id: "welcome-user", role: "user", content: "Turn our customer notes into a focused launch plan." },
  { id: "welcome-assistant", role: "assistant", content: "Start with one measurable activation outcome. I would sequence the work into three releases: validate the core workflow, remove onboarding friction, then expand collaboration." },
];

const demoReply = "For this local preview, I would turn that into a one-week experiment: name the user outcome, choose one leading metric, and ship the smallest workflow that can prove or disprove the assumption.";

export function DemoWorkspace() {
  const [view, setView] = useState<DemoView>("chat");
  const [messages, setMessages] = useState<DemoMessage[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);

  const title = useMemo(() => ({ chat: "Product launch plan", admin: "Organization overview", settings: "Workspace settings" })[view], [view]);

  async function sendMessage() {
    const content = prompt.trim();
    if (!content || streaming) return;
    const assistantId = crypto.randomUUID();
    setPrompt("");
    setStreaming(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content }, { id: assistantId, role: "assistant", content: "" }]);
    for (const word of demoReply.split(" ")) {
      await new Promise((resolve) => window.setTimeout(resolve, 18));
      setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, content: `${message.content}${message.content ? " " : ""}${word}` } : message));
    }
    setStreaming(false);
  }

  function resetDemo() {
    setMessages(initialMessages);
    setPrompt("");
    setStreaming(false);
    setView("chat");
  }

  return <main className="workspace-shell demo-workspace">
    <aside className="workspace-sidebar">
      <Link className="brand light" href="/"><span className="brand-mark">t</span><span>canvas</span></Link>
      <div className="demo-sidebar-label">Product preview</div>
      <nav className="demo-navigation" aria-label="Demo sections">
        <button className={view === "chat" ? "active" : ""} onClick={() => setView("chat")}>Chat workspace</button>
        <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>Admin</button>
        <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>Settings</button>
      </nav>
      <div className="sidebar-footer">
        <Link href="/setup">Set up real login</Link>
        <button onClick={resetDemo}>Reset demo</button>
      </div>
    </aside>
    <section className="workspace-main">
      <div className="demo-disclosure" role="status"><strong>Local product preview</strong><span>No authentication · Browser-only · Resets on refresh</span></div>
      <header className="workspace-header"><div><span className="eyebrow">Demo organization</span><h1>{title}</h1></div><div className="account-pill">demo@local.invalid<span>not authenticated</span></div></header>

      {view === "chat" && <>
        <div className="messages demo-messages">
          {messages.map((message) => <article className={`message ${message.role}`} key={message.id}><span>{message.role === "user" ? "You" : "Canvas"}</span><p>{message.content || "Thinking…"}</p></article>)}
        </div>
        <div className="composer"><textarea aria-label="Demo message" maxLength={2_000} placeholder="Try the local demo…" value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} /><button aria-label="Send demo message" disabled={!prompt.trim() || streaming} onClick={() => void sendMessage()}>{streaming ? "…" : "↑"}</button><small>This response is deterministic demo copy. No request leaves this browser.</small></div>
        <div className="usage-line"><span>Illustrative monthly usage</span><span>3,240 / 20,000 units</span></div>
      </>}

      {view === "admin" && <section className="demo-panel" aria-labelledby="demo-admin-title">
        <div><span className="eyebrow">Role-aware administration</span><h2 id="demo-admin-title">People and recent activity</h2><p>Production data is scoped to the organization from the validated Tuurio token. These rows are static examples.</p></div>
        <div className="demo-stat-grid"><article><strong>3</strong><span>Members</span></article><article><strong>1</strong><span>Administrator</span></article><article><strong>64%</strong><span>Quota remaining</span></article></div>
        <div className="demo-table" role="table" aria-label="Example organization members">
          <div role="row"><strong role="columnheader">Member</strong><strong role="columnheader">Role</strong><strong role="columnheader">Status</strong></div>
          <div role="row"><span role="cell">Alex Morgan</span><span role="cell">Admin</span><span role="cell">Active</span></div>
          <div role="row"><span role="cell">Sam Rivera</span><span role="cell">Member</span><span role="cell">Active</span></div>
          <div role="row"><span role="cell">Jordan Lee</span><span role="cell">Member</span><span role="cell">Invited</span></div>
        </div>
        <div className="demo-audit"><h3>Audit preview</h3><p><span>conversation.created</span><time>2 min ago</time></p><p><span>member.invited</span><time>Yesterday</time></p></div>
      </section>}

      {view === "settings" && <section className="demo-panel" aria-labelledby="demo-settings-title">
        <div><span className="eyebrow">Deployment boundaries</span><h2 id="demo-settings-title">Safe defaults, visible tradeoffs</h2><p>The real starter reads server credentials only from its deployment environment and keeps public OIDC configuration separate.</p></div>
        <div className="settings-grid demo-settings-grid">
          <article><span>Identity</span><strong>Not connected in demo</strong><p>Provision an exact public client from the setup guide.</p></article>
          <article><span>Storage</span><strong>Browser-only preview</strong><p>The authenticated workspace supports Postgres or an explicit memory mode.</p></article>
          <article><span>AI provider</span><strong>Deterministic demo</strong><p>No model key or external request is used here.</p></article>
          <article><span>Data region</span><strong>Choose at deployment</strong><p>Tuurio identity is EU-hosted; app and model hosting remain your choice.</p></article>
        </div>
        <Link className="button" href="/setup">Connect this installation</Link>
      </section>}
    </section>
  </main>;
}
