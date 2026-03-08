function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function icon(name, size = 18) {
  const paths = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    database:
      '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    'id-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  };

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

function highlightJsonHtml(escapedHtml) {
  return escapedHtml
    .replace(
      /(&quot;)((?:(?!&quot;).)*?)(&quot;)(\s*:)/g,
      '<span class="hl-key">$1$2$3</span>$4',
    )
    .replace(
      /(:\s*)(&quot;)((?:(?!&quot;).)*?)(&quot;)/g,
      '$1<span class="hl-str">$2$3$4</span>',
    )
    .replace(
      /([\[,]\s*)(&quot;)((?:(?!&quot;).)*?)(&quot;)/g,
      '$1<span class="hl-str">$2$3$4</span>',
    )
    .replace(
      /(:\s*)(-?\d+(?:\.\d+)?)([,\s\n\r}])/g,
      '$1<span class="hl-num">$2</span>$3',
    )
    .replace(/(:\s*)(true|false|null)\b/g, '$1<span class="hl-bool">$2</span>');
}

function authorityHost(authority) {
  try {
    return new URL(authority).host;
  } catch {
    return 'id.tuurio.com';
  }
}

function renderPage(status, content) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tuurio Auth Studio</title>
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div id="app">${renderShell(status, content)}</div>
    ${renderCopyScript()}
  </body>
</html>`;
}

function renderCopyScript() {
  return `<script>
    document.querySelectorAll('.token-block, .code-block').forEach(function(pre) {
      var wrap = document.createElement('div');
      wrap.className = 'copy-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function() {
        navigator.clipboard.writeText(pre.textContent).then(function() {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function() {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      });
      wrap.appendChild(btn);
    });
  </script>`;
}

function renderShell(status, content) {
  const tone = escapeHtml(status.tone);
  const label = escapeHtml(status.label);
  const host = escapeHtml(authorityHost(status.authority || 'https://id.tuurio.com'));

  return `
    <div class="app">
      <aside class="side-panel">
        <div class="brand">
          <div class="logo-mark">tu</div>
          <div>
            <p class="brand-name">Tuurio Auth Studio</p>
            <p class="brand-subtitle">OIDC playground for OAuth 2.0</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for<br>secure sign in.</h1>
          <p class="muted">
            A minimal Node.js server that authenticates with OpenID Connect,
            inspects decoded tokens, and handles secure logout.
          </p>
          <div class="status-row">
            <span class="status status-${tone}">${label}</span>
            <span class="muted">${host}</span>
          </div>
        </div>
        <div class="side-list">
          <div class="side-list-item">
            <span class="side-list-icon">${icon('code', 16)}</span>
            <div>
              <span class="side-list-label">Architecture</span>
              <span class="side-list-value">Auth code + PKCE</span>
            </div>
          </div>
          <div class="side-list-item">
            <span class="side-list-icon">${icon('server', 16)}</span>
            <div>
              <span class="side-list-label">Storage</span>
              <span class="side-list-value">In-memory session</span>
            </div>
          </div>
          <div class="side-list-item">
            <span class="side-list-icon">${icon('layers', 16)}</span>
            <div>
              <span class="side-list-label">Scope</span>
              <span class="side-list-value">openid profile email</span>
            </div>
          </div>
        </div>
      </aside>
      <main class="main-panel">${content}</main>
    </div>
  `;
}

function renderLoginView({ error, authorityHost: host }) {
  const errorHtml = error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : '';

  return `
    <div class="stack">
      <section class="card card-hero">
        <div class="card-header">
          <span class="eyebrow">OAuth 2.0 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            Authenticate with the authorization code flow and PKCE.
            Tokens are exchanged server-side and stored in memory.
          </p>
        </div>
        <div class="button-row">
          <a class="button primary" href="/login">
            Continue with Tuurio ID
            <span class="btn-arrow">&rarr;</span>
          </a>
          <span class="helper">Redirects to ${escapeHtml(host)}</span>
        </div>
        ${errorHtml}
      </section>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">${icon('shield', 18)}</div>
          <h3>PKCE by default</h3>
          <p class="muted">Proof Key for Code Exchange prevents authorization code interception attacks.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">${icon('clock', 18)}</div>
          <h3>Short-lived tokens</h3>
          <p class="muted">Access tokens expire quickly, scoped to openid&nbsp;profile&nbsp;email.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">${icon('server', 18)}</div>
          <h3>Session aware</h3>
          <p class="muted">Token state lives server-side. Nothing sensitive reaches the browser.</p>
        </div>
      </div>
    </div>
  `;
}

function renderTokenView(session, options) {
  const accessClaims = session.accessClaims || null;
  const idClaims = session.idClaims || null;
  const profileJson = session.profileJson || 'No profile data.';
  const scopeLabel = session.scope || 'openid profile email';

  const timingParts = [];
  if (accessClaims && typeof accessClaims.iat === 'number') {
    timingParts.push(`Issued ${formatDuration(Math.floor(Date.now() / 1000) - accessClaims.iat)} ago`);
  }
  if (typeof session.expiresAt === 'number') {
    const remaining = session.expiresAt - Math.floor(Date.now() / 1000);
    timingParts.push(
      remaining > 0
        ? `${formatDuration(remaining)} remaining`
        : `expired ${formatDuration(Math.abs(remaining))} ago`,
    );
  }
  const expiryLine = timingParts.length
    ? `<code>${escapeHtml(scopeLabel)}</code> &middot; ${timingParts.join(' &middot; ')}`
    : `<code>${escapeHtml(scopeLabel)}</code>`;

  return `
    <div class="stack">
      <section class="card card-hero">
        <div class="card-header">
          <span class="badge badge-success">${icon('check-circle', 14)} Authenticated</span>
          <h2 class="card-title">Session active</h2>
          <p class="muted">${expiryLine}</p>
        </div>
        <div class="button-row">
          <a class="button ghost" href="/logout">Log out and end session</a>
          <span class="helper">Clears local state and notifies the identity provider.</span>
        </div>
      </section>

      <section class="card">
        <div class="section-header">
          <div class="section-icon">${icon('user', 18)}</div>
          <div>
            <h3 class="section-title">User profile</h3>
            <p class="muted">Claims returned by the UserInfo endpoint.</p>
          </div>
        </div>
        <pre class="code-block">${highlightJsonHtml(escapeHtml(profileJson))}</pre>
      </section>

      ${renderTokenPanel(
        'Access Token',
        session.access_token || '',
        accessClaims,
        'Authorizes API requests on behalf of the user.',
        'key',
      )}
      ${renderTokenPanel(
        'ID Token',
        session.id_token || '',
        idClaims,
        'Cryptographic proof of the authenticated identity.',
        'id-card',
      )}

      ${renderDiscoverySection(options.authority, options.discoveryEndpoint)}
    </div>
  `;
}

function renderTokenPanel(title, token, decoded, description, iconName) {
  const tokenValue = token ? escapeHtml(token) : 'Not provided';
  const preview = token ? `${escapeHtml(token.slice(0, 48))}&hellip;` : 'Not provided';
  const decodedText = decoded
    ? JSON.stringify(decoded, null, 2)
    : 'Not a JWT or unable to decode.';

  return `
    <section class="card">
      <div class="section-header">
        <div class="section-icon">${icon(iconName, 18)}</div>
        <div>
          <h3 class="section-title">${escapeHtml(title)}</h3>
          <p class="muted">${escapeHtml(description)}</p>
        </div>
      </div>
      <details class="token-details">
        <summary class="token-summary">
          <span class="eyebrow">Raw JWT</span>
          <code class="token-preview">${preview}</code>
        </summary>
        <pre class="token-block">${tokenValue}</pre>
      </details>
      <div class="token-claims">
        <span class="eyebrow">Decoded payload</span>
        <pre class="code-block">${highlightJsonHtml(escapeHtml(decodedText))}</pre>
      </div>
    </section>
  `;
}

function renderDiscoverySection(authority, discoveryEndpoint) {
  return `
    <section class="card">
      <div class="section-header">
        <div class="section-icon">${icon('globe', 18)}</div>
        <div>
          <h3 class="section-title">Provider discovery</h3>
          <p class="muted">OIDC metadata used to resolve endpoints and session management URLs.</p>
        </div>
      </div>
      <div class="stack">
        <div>
          <span class="eyebrow">Authority</span>
          <p><a class="link" href="${escapeHtml(authority)}" target="_blank" rel="noreferrer">${escapeHtml(authority)}</a></p>
        </div>
        <div>
          <span class="eyebrow">Discovery document</span>
          <p><a class="link" href="${escapeHtml(discoveryEndpoint)}" target="_blank" rel="noreferrer">${escapeHtml(discoveryEndpoint)}</a></p>
        </div>
      </div>
    </section>
  `;
}

function renderNotFound() {
  return `
    <section class="card card-hero">
      <div class="card-header">
        <span class="badge badge-error">${icon('x-circle', 14)} 404</span>
        <h2 class="card-title">Route not found</h2>
        <p class="muted">This path doesn't match any known endpoint.</p>
      </div>
      <div class="button-row">
        <a class="button ghost" href="/">
          Go home
          <span class="btn-arrow">&rarr;</span>
        </a>
      </div>
    </section>
  `;
}

function renderLogoutCallback({ sessionCookieName }) {
  return `
    <div class="stack">
      <section class="card card-hero">
        <div class="card-header">
          <span class="badge badge-neutral">${icon('check-circle', 14)} Session ended</span>
          <h2 class="card-title">Successfully signed out</h2>
          <p class="muted">
            Local session destroyed. The identity provider has been notified via RP-Initiated Logout.
          </p>
        </div>
        <div class="button-row">
          <a class="button primary" href="/login">
            Sign in again
            <span class="btn-arrow">&rarr;</span>
          </a>
          <span class="helper">Redirects to the identity provider.</span>
        </div>
      </section>

      <section class="card">
        <div class="section-header">
          <div class="section-icon">${icon('server', 18)}</div>
          <div>
            <h3 class="section-title">Session state</h3>
            <p class="muted">Local session data has been cleared before returning to this page.</p>
          </div>
        </div>
        <div class="stack">
          <div>
            <span class="eyebrow">Session cookie</span>
            <p class="muted">${escapeHtml(sessionCookieName)} cleared</p>
          </div>
          <div>
            <span class="eyebrow">Tokens</span>
            <p class="muted">Access token and ID token removed from the local session.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function formatDuration(seconds) {
  const abs = Math.abs(seconds);
  if (abs < 60) return `${abs}s`;
  if (abs < 3600) {
    const minutes = Math.floor(abs / 60);
    const remainder = abs % 60;
    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

module.exports = {
  renderPage,
  renderLoginView,
  renderTokenView,
  renderLogoutCallback,
  renderNotFound,
  escapeHtml,
};
