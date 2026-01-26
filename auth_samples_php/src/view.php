<?php

declare(strict_types=1);

function escape_html(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function render_page(array $status, string $content): void
{
    echo '<!doctype html>';
    echo '<html lang="en">';
    echo '<head>';
    echo '<meta charset="utf-8" />';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1" />';
    echo '<title>Tuurio Auth PHP Server Demo</title>';
    echo '<link rel="stylesheet" href="/assets/app.css" />';
    echo '</head>';
    echo '<body>';
    echo '<div id="app">';
    echo render_shell($status, $content);
    echo '</div>';
    echo '</body>';
    echo '</html>';
}

function render_shell(array $status, string $content): string
{
    $tone = escape_html($status['tone']);
    $label = escape_html($status['label']);

    return <<<HTML
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
            A minimal PHP server client that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div class="status-row">
            <span class="status status-{$tone}">{$label}</span>
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
            <p>Server session storage</p>
          </div>
          <div>
            <span class="eyebrow">Scope</span>
            <p>openid profile email</p>
          </div>
        </div>
      </aside>
      <main class="main-panel">{$content}</main>
    </div>
HTML;
}
