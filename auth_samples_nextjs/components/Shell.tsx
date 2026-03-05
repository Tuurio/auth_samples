"use client";

import type { ReactNode } from "react";
import { authAuthorityHost } from "../lib/auth";

export type ShellStatus = { label: string; tone: "good" | "neutral" };

export function Shell({ children, status }: { children: ReactNode; status: ShellStatus }) {
  return (
    <div className="app">
      <aside className="side-panel">
        <div className="brand">
          <div className="logo-mark">tu</div>
          <div>
            <p className="brand-name">Tuurio Auth Studio</p>
            <p className="brand-subtitle">OIDC playground for OAuth 2.1</p>
          </div>
        </div>
        <div className="side-card">
          <h1>Design for secure sign-in.</h1>
          <p className="muted">
            A minimal Next.js client that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div className="status-row">
            <span className={`status status-${status.tone}`}>{status.label}</span>
            <span className="muted">Authority: {authAuthorityHost}</span>
          </div>
        </div>
        <div className="side-list">
          <div>
            <span className="eyebrow">Architecture</span>
            <p>Authorization code flow + PKCE</p>
          </div>
          <div>
            <span className="eyebrow">Storage</span>
            <p>Session storage for tokens</p>
          </div>
          <div>
            <span className="eyebrow">Scope</span>
            <p>openid profile email</p>
          </div>
        </div>
      </aside>
      <main className="main-panel">{children}</main>
    </div>
  );
}
