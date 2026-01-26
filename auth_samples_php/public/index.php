<?php

declare(strict_types=1);

session_start();

$config = require __DIR__ . '/../src/config.php';
require __DIR__ . '/../src/oauth.php';
require __DIR__ . '/../src/view.php';

$session = $_SESSION['auth'] ?? null;
$error = $_SESSION['error'] ?? null;
unset($_SESSION['error']);

$status = [
    'label' => $session ? 'Authenticated' : 'Signed out',
    'tone' => $session ? 'good' : 'neutral',
];

$content = $session
    ? render_token_view($session)
    : render_login_view($error);

render_page($status, $content);

function render_login_view(?string $error): string
{
    $errorHtml = $error ? '<div class="status status-bad">' . escape_html($error) . '</div>' : '';

    return <<<HTML
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
        {$errorHtml}
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
            <p class="muted">Token state is persisted in server session storage.</p>
          </div>
        </div>
      </section>
    </div>
HTML;
}

function render_token_view(array $session): string
{
    $accessToken = $session['access_token'] ?? '';
    $idToken = $session['id_token'] ?? '';
    $scopeLabel = $session['scope'] ?? 'openid profile email';
    $expires = format_time($session['expires_at'] ?? null);
    $profileJson = $session['profile_json'] ?? 'No profile data.';

    $accessDecoded = decode_jwt($accessToken);
    $idDecoded = decode_jwt($idToken);

    $accessDecodedText = $accessDecoded ? json_encode($accessDecoded, JSON_PRETTY_PRINT) : 'Not a JWT or unable to decode.';
    $idDecodedText = $idDecoded ? json_encode($idDecoded, JSON_PRETTY_PRINT) : 'Not a JWT or unable to decode.';
    $accessPanel = render_token_panel('Access Token', $accessToken, $accessDecodedText, 'Used to call protected APIs.');
    $idPanel = render_token_panel('ID Token', $idToken, $idDecodedText, 'Proves the authenticated user.');
    $profileJsonEscaped = escape_html($profileJson);

    return <<<HTML
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">Session ready</span>
          <h2 class="card-title">You're signed in</h2>
          <p class="muted">Tokens expire at {$expires} and are scoped for {$scopeLabel}.</p>
        </div>
        <div class="button-row">
          <a class="button ghost" href="/logout">Logout</a>
          <span class="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </section>

      <div class="token-grid">
        {$accessPanel}
        {$idPanel}
      </div>

      <section class="card card-soft">
        <h3 class="section-title">User profile (UserInfo)</h3>
        <pre class="code-block">{$profileJsonEscaped}</pre>
      </section>
    </div>
HTML;
}

function render_token_panel(string $title, string $token, string $decoded, string $description): string
{
    $tokenLabel = $token !== '' ? escape_html($token) : 'Not provided';
    $decodedLabel = escape_html($decoded);
    $titleLabel = escape_html($title);
    $descriptionLabel = escape_html($description);

    return <<<HTML
    <section class="card card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">{$titleLabel}</h3>
          <p class="muted">{$descriptionLabel}</p>
        </div>
      </div>
      <pre class="token-block">{$tokenLabel}</pre>
      <div class="token-claims">
        <span class="eyebrow">Decoded claims</span>
        <pre class="code-block">{$decodedLabel}</pre>
      </div>
    </section>
HTML;
}
