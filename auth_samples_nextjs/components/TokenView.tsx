"use client";

import { useMemo } from "react";
import type { User } from "oidc-client-ts";
import { Card } from "./Card";
import { TokenPanel } from "./TokenPanel";
import { decodeJwt, formatUnixTime } from "../lib/jwt";

export function TokenView({ user, onLogout }: { user: User; onLogout: () => Promise<void> }) {
  const accessTokenInfo = useMemo(() => decodeJwt(user.access_token), [user.access_token]);
  const idToken = user.id_token ?? "";
  const idTokenInfo = useMemo(() => decodeJwt(idToken), [idToken]);
  const scopeLabel = user.scope || "openid profile email";

  return (
    <div className="stack">
      <Card>
        <div className="card-header">
          <span className="eyebrow">Session ready</span>
          <h2 className="card-title">You're signed in</h2>
          <p className="muted">
            Tokens expire at {formatUnixTime(user.expires_at)} and are scoped for {scopeLabel}.
          </p>
        </div>
        <div className="button-row">
          <button className="button ghost" onClick={onLogout}>
            Logout
          </button>
          <span className="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </Card>

      <div className="token-grid">
        <TokenPanel
          title="Access Token"
          token={user.access_token}
          decoded={accessTokenInfo}
          description="Used to call protected APIs."
        />
        <TokenPanel
          title="ID Token"
          token={idToken}
          decoded={idTokenInfo}
          description="Proves the authenticated user."
        />
      </div>

      <Card tone="soft">
        <h3 className="section-title">User profile</h3>
        <pre className="code-block">{JSON.stringify(user.profile, null, 2)}</pre>
      </Card>
    </div>
  );
}
