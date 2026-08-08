"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildProvisioningCommand } from "@/lib/setup-command";

export function SetupGuide() {
  const [command, setCommand] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCommand(buildProvisioningCommand(window.location.origin));
  }, []);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
  }

  return <main className="setup-page">
    <Link className="brand" href="/"><span className="brand-mark">t</span><span>tuurio canvas</span></Link>
    <section className="setup-card">
      <span className="eyebrow">One-time identity setup</span>
      <h1>Connect this installation to Tuurio ID.</h1>
      <p className="setup-lead">Every installation receives its own public OIDC client and exact callback URLs. No client secret is placed in the browser.</p>
      <ol className="setup-steps">
        <li><span>1</span><div><strong>Use the final app origin</strong><p>For production, deploy first and open this page on the stable HTTPS domain.</p></div></li>
        <li><span>2</span><div><strong>Run the reviewed command</strong><p>Run it from the project root. You approve the command and complete the secure browser handoff yourself.</p></div></li>
        <li><span>3</span><div><strong>Restart and verify</strong><p>The CLI writes only public OIDC data to <code>src/tuurio.public.json</code>. Restart the app, then test sign-in and sign-out.</p></div></li>
      </ol>
      <div className="command-card">
        <div><span>Command for this origin</span><code>{command || "Resolving current origin…"}</code></div>
        <button className="button" disabled={!command} onClick={() => void copyCommand()}>{copied ? "Copied" : "Copy command"}</button>
      </div>
      <div className="setup-safety"><strong>Human checkpoint</strong><p>Never give an agent passwords, tokens, authorization codes, cookies, legal acceptance, or environment-file contents.</p></div>
      <div className="hero-actions"><Link className="button secondary" href="/demo">Explore demo first</Link><Link className="button secondary" href="/">Back home</Link></div>
    </section>
  </main>;
}
