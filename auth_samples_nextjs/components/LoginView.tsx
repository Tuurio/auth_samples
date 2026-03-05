"use client";

import { Card } from "./Card";
import { Feature } from "./Feature";
import { authAuthorityHost } from "../lib/auth";

export function LoginView({
  onLogin,
  error,
}: {
  onLogin: () => Promise<void>;
  error: string | null;
}) {
  return (
    <div className="stack">
      <Card>
        <div className="card-header">
          <span className="eyebrow">OAuth 2.1 + OpenID Connect</span>
          <h2 className="card-title">Sign in to continue</h2>
          <p className="muted">
            This app uses the authorization code flow with PKCE to fetch tokens securely for a
            browser-based client.
          </p>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={onLogin}>
            Continue with Tuurio ID
          </button>
          <span className="helper">You&apos;ll be redirected to {authAuthorityHost}</span>
        </div>
        {error ? <div className="status status-bad">{error}</div> : null}
      </Card>
      <Card tone="soft">
        <div className="feature-grid">
          <Feature title="PKCE by default" body="Proof Key for Code Exchange protects the code flow." />
          <Feature title="Short-lived tokens" body="Access tokens are scoped to openid profile email." />
          <Feature title="Session aware" body="Token state is persisted in session storage." />
        </div>
      </Card>
    </div>
  );
}
