"use client";

import { Card } from "./Card";

export function TokenPanel({
  title,
  decoded,
  description,
}: {
  title: string;
  decoded: Record<string, unknown> | null;
  description: string;
}) {
  return (
    <Card tone="panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p className="muted">{description}</p>
        </div>
      </div>
      <div className="token-claims">
        <span className="eyebrow">Decoded claims</span>
        <pre className="code-block">
          {decoded ? JSON.stringify(decoded, null, 2) : "Not a JWT or unable to decode."}
        </pre>
      </div>
    </Card>
  );
}
