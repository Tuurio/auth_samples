"use client";

import { useState } from "react";
import { Card } from "./Card";

export function TokenPanel({
  title,
  token,
  decoded,
  description,
}: {
  title: string;
  token: string;
  decoded: Record<string, unknown> | null;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard || !token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card tone="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p className="muted">{description}</p>
        </div>
        <button className="button small ghost" onClick={handleCopy} disabled={!token}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="token-block">{token || "Not provided"}</pre>
      <div className="token-claims">
        <span className="eyebrow">Decoded claims</span>
        <pre className="code-block">
          {decoded ? JSON.stringify(decoded, null, 2) : "Not a JWT or unable to decode."}
        </pre>
      </div>
    </Card>
  );
}
