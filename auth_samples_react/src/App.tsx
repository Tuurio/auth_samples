import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import type { User } from "oidc-client-ts";
import { useAuth } from "./AuthProvider";
import { runtimeAuthConfig } from "./auth";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Home() {
  const { user, profile, loading, error, login, logout } = useAuth();

  return (
    <Shell
      status={
        loading
          ? { label: "Checking session", tone: "neutral" }
          : user
            ? { label: "Authenticated", tone: "good" }
            : { label: "Signed out", tone: "neutral" }
      }
    >
      {loading ? (
        <Card>
          <LoadingState title="Loading session" subtitle="Verifying tokens and session state." />
        </Card>
      ) : user ? (
        <TokenView user={user} profile={profile} onLogout={logout} />
      ) : (
        <LoginView onLogin={login} error={error} />
      )}
    </Shell>
  );
}

function AuthCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    handleCallback()
      .then(() => {
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Login failed.");
      });
  }, [handleCallback, navigate]);

  return (
    <Shell status={{ label: "Finalizing login", tone: "neutral" }}>
      <Card>
        {error ? (
          <div className="stack">
            <div className="status status-bad">Authentication error</div>
            <h2 className="card-title">We couldn&apos;t finish signing you in.</h2>
            <p className="muted">{error}</p>
            <button className="button ghost" onClick={() => navigate("/", { replace: true })}>
              Back to login
            </button>
          </div>
        ) : (
          <LoadingState title="Completing sign-in" subtitle="Processing the authorization response." />
        )}
      </Card>
    </Shell>
  );
}

function LoginView({ onLogin, error }: { onLogin: () => Promise<void>; error: string | null }) {
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
          <span className="helper">You&apos;ll be redirected to {runtimeAuthConfig.authorityHost}</span>
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

function TokenView({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Record<string, unknown> | null;
  onLogout: () => Promise<void>;
}) {
  const accessTokenInfo = useMemo(() => decodeJwt(user.access_token), [user.access_token]);
  const idToken = user.id_token ?? "";
  const idTokenInfo = useMemo(() => decodeJwt(idToken), [idToken]);
  const scopeLabel = user.scope || "openid profile email";

  return (
    <div className="stack">
      <Card>
        <div className="card-header">
          <span className="eyebrow">Session ready</span>
          <h2 className="card-title">You&apos;re signed in</h2>
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
        <h3 className="section-title">User profile (UserInfo)</h3>
        <pre className="code-block">
          {profile ? JSON.stringify(profile, null, 2) : "No profile data."}
        </pre>
      </Card>
    </div>
  );
}

function TokenPanel({
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

function Shell({
  children,
  status,
}: {
  children: ReactNode;
  status: { label: string; tone: "good" | "neutral" };
}) {
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
            A minimal React client that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div className="status-row">
            <span className={`status status-${status.tone}`}>{status.label}</span>
            <span className="muted">Authority: {runtimeAuthConfig.authorityHost}</span>
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

function Card({
  children,
  tone = "solid",
}: {
  children: ReactNode;
  tone?: "solid" | "soft" | "panel";
}) {
  return <section className={`card card-${tone}`}>{children}</section>;
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="feature">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
    </div>
  );
}

function LoadingState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <div>
        <h2 className="card-title">{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <Shell status={{ label: "Route not found", tone: "neutral" }}>
      <Card>
        <div className="stack">
          <div className="status status-bad">404</div>
          <h2 className="card-title">This route doesn&apos;t exist.</h2>
          <p className="muted">Return to the login page to start a new session.</p>
          <button className="button ghost" onClick={() => navigate("/", { replace: true })}>
            Go home
          </button>
        </div>
      </Card>
    </Shell>
  );
}

function decodeJwt(token: string): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = padded.length % 4;
  const base64 = padLength ? padded.padEnd(padded.length + (4 - padLength), "=") : padded;
  return atob(base64);
}

function formatUnixTime(unixSeconds: number | undefined) {
  if (!unixSeconds) return "unknown time";
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleString();
}

export default App;
