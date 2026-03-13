<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tuurio Auth Studio - Laravel</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('assets/app.css') }}">
</head>
<body>
<div id="app">
    <div class="app">
        <aside class="side-panel">
            <div class="brand">
                <div class="logo-mark">tu</div>
                <div>
                    <p class="brand-name">Tuurio Auth Studio</p>
                    <p class="brand-subtitle">Laravel OIDC sample</p>
                </div>
            </div>

            <div class="side-card">
                <h1>Build secure<br>server auth.</h1>
                <p class="muted">
                    A Laravel sample for OAuth 2.0 / OpenID Connect with PKCE,
                    session-backed login, token inspection, logout, and webhook handling.
                </p>
                <div class="status-row">
                    <span class="status status-{{ $statusTone ?? 'neutral' }}">{{ $statusLabel ?? 'Ready' }}</span>
                    <span class="muted">{{ $authorityHost ?? 'id.tuurio.com' }}</span>
                </div>
            </div>

            <div class="side-list">
                <div class="side-list-item">
                    <span class="side-list-icon">Architecture</span>
                    <div>
                        <span class="side-list-label">Flow</span>
                        <span class="side-list-value">Auth code + PKCE</span>
                    </div>
                </div>
                <div class="side-list-item">
                    <span class="side-list-icon">Storage</span>
                    <div>
                        <span class="side-list-label">Session</span>
                        <span class="side-list-value">Laravel session driver</span>
                    </div>
                </div>
                <div class="side-list-item">
                    <span class="side-list-icon">Scope</span>
                    <div>
                        <span class="side-list-label">Default</span>
                        <span class="side-list-value">openid profile email</span>
                    </div>
                </div>
            </div>
        </aside>

        <main class="main-panel">
            @yield('content')
        </main>
    </div>
</div>
</body>
</html>
