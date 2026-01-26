function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderPage(status, content) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tuurio Auth Node Demo</title>
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div id="app">${renderShell(status, content)}</div>
  </body>
</html>`;
}

function renderShell(status, content) {
  const tone = escapeHtml(status.tone);
  const label = escapeHtml(status.label);

  return `
    <div class="app">
      <aside class="side-panel">
        <div class="brand">
          <div class="logo-mark">tu</div>
          <div>
            <p class="brand-name">Tuurio Auth Studio</p>
            <p class="brand-subtitle">OIDC playground for OAuth 2.1</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for secure sign-in.</h1>
          <p class="muted">
            A minimal Node.js server that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div class="status-row">
            <span class="status status-${tone}">${label}</span>
            <span class="muted">Authority: test.id.tuurio.com</span>
          </div>
        </div>
        <div class="side-list">
          <div>
            <span class="eyebrow">Architecture</span>
            <p>Authorization code flow + PKCE</p>
          </div>
          <div>
            <span class="eyebrow">Storage</span>
            <p>In-memory session</p>
          </div>
          <div>
            <span class="eyebrow">Scope</span>
            <p>openid profile email</p>
          </div>
        </div>
      </aside>
      <main class="main-panel">${content}</main>
    </div>
  `;
}

function renderLoginView(error) {
  const errorHtml = error ? `<div class="status status-bad">${escapeHtml(error)}</div>` : '';
  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">OAuth 2.1 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            This app uses the authorization code flow with PKCE to fetch tokens securely for a
            browser-based client.
          </p>
        </div>
        <div class="button-row">
          <a class="button primary" href="/login">Continue with Tuurio ID</a>
          <span class="helper">You'll be redirected to test.id.tuurio.com</span>
        </div>
        ${errorHtml}
      </section>
      <section class="card card-soft">
        <div class="feature-grid">
          <div class="feature">
            <h3>PKCE by default</h3>
            <p class="muted">Proof Key for Code Exchange protects the code flow.</p>
          </div>
          <div class="feature">
            <h3>Short-lived tokens</h3>
            <p class="muted">Access tokens are scoped to openid profile email.</p>
          </div>
          <div class="feature">
            <h3>Session aware</h3>
            <p class="muted">Token state is persisted in memory.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTokenView(session, decodedAccess, decodedId, profileJson) {
  const accessPanel = renderTokenPanel(
    'Access Token',
    session.access_token,
    decodedAccess,
    'Used to call protected APIs.',
  );
  const idPanel = renderTokenPanel(
    'ID Token',
    session.id_token || '',
    decodedId,
    'Proves the authenticated user.',
  );

  return `
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">Session ready</span>
          <h2 class="card-title">You're signed in</h2>
          <p class="muted">Tokens expire at ${escapeHtml(session.expiresLabel)} and are scoped for ${escapeHtml(
    session.scopeLabel,
  )}.</p>
        </div>
        <div class="button-row">
          <a class="button ghost" href="/logout">Logout</a>
          <span class="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </section>

      <div class="token-grid">
        ${accessPanel}
        ${idPanel}
      </div>

      <section class="card card-soft">
        <h3 class="section-title">User profile (UserInfo)</h3>
        <pre class="code-block">${escapeHtml(profileJson)}</pre>
      </section>
    </div>
  `;
}

function renderTokenPanel(title, token, decoded, description) {
  const tokenLabel = token ? escapeHtml(token) : 'Not provided';
  const decodedLabel = escapeHtml(decoded);
  return `
    <section class="card card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">${escapeHtml(title)}</h3>
          <p class="muted">${escapeHtml(description)}</p>
        </div>
      </div>
      <pre class="token-block">${tokenLabel}</pre>
      <div class="token-claims">
        <span class="eyebrow">Decoded claims</span>
        <pre class="code-block">${decodedLabel}</pre>
      </div>
    </section>
  `;
}

function renderNotFound() {
  return `
    <section class="card">
      <div class="stack">
        <div class="status status-bad">404</div>
        <h2 class="card-title">This route doesn't exist.</h2>
        <p class="muted">Return to the login page to start a new session.</p>
        <a class="button ghost" href="/">Go home</a>
      </div>
    </section>
  `;
}

module.exports = {
  renderPage,
  renderLoginView,
  renderTokenView,
  renderNotFound,
  escapeHtml,
};
