@extends('layouts.app')

@section('content')
    <section class="hero">
        <div>
            <span class="eyebrow">Laravel web app</span>
            <h2>Server-rendered sign-in with Tuurio ID</h2>
            <p class="muted">
                This sample authenticates against your tenant issuer, stores tokens in the Laravel session,
                shows decoded claims, and provides a webhook listener protected by an API key header.
            </p>
        </div>
        <div class="hero-actions">
            @if ($isAuthenticated)
                <a class="button primary" href="{{ route('logout') }}">Log out and end session</a>
            @else
                <a class="button primary" href="{{ route('login') }}">Sign in with Tuurio ID</a>
            @endif
        </div>
    </section>

    @if ($errorMessage)
        <section class="panel danger-panel">
            <h3>Authentication error</h3>
            <p class="muted">{{ $errorMessage }}</p>
        </section>
    @endif

    @if ($successMessage)
        <section class="panel success-panel">
            <h3>Session updated</h3>
            <p class="muted">{{ $successMessage }}</p>
        </section>
    @endif

    <section class="grid two-up">
        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">Runtime config</span>
                    <h3>Tuurio endpoints</h3>
                </div>
            </div>
            <dl class="detail-list">
                @foreach ($configSummary as $label => $value)
                    <div>
                        <dt>{{ $label }}</dt>
                        <dd>{{ $value !== '' ? $value : 'not configured' }}</dd>
                    </div>
                @endforeach
            </dl>
        </article>

        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">Session</span>
                    <h3>Current subject</h3>
                </div>
            </div>
            @if (!empty($userInfo))
                <dl class="detail-list">
                    @foreach ($userInfo as $key => $value)
                        @if (is_scalar($value) || $value === null)
                            <div>
                                <dt>{{ $key }}</dt>
                                <dd>{{ $value === null || $value === '' ? '-' : $value }}</dd>
                            </div>
                        @endif
                    @endforeach
                </dl>
            @else
                <p class="muted">No user is signed in yet. Start the flow to inspect ID token and UserInfo claims.</p>
            @endif
        </article>
    </section>

    <section class="grid two-up">
        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">ID token</span>
                    <h3>Decoded claims</h3>
                </div>
            </div>
            @if ($idTokenJson)
                <pre class="token-block">{{ $idTokenJson }}</pre>
            @else
                <p class="muted">Sign in to inspect the ID token payload.</p>
            @endif
        </article>

        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">Access token</span>
                    <h3>Decoded claims</h3>
                </div>
            </div>
            @if ($accessTokenJson)
                <pre class="token-block">{{ $accessTokenJson }}</pre>
            @else
                <p class="muted">Sign in to inspect the access token payload.</p>
            @endif
        </article>
    </section>

    <section class="grid two-up">
        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">UserInfo</span>
                    <h3>OpenID Connect user profile</h3>
                </div>
            </div>
            @if ($userInfoJson)
                <pre class="token-block">{{ $userInfoJson }}</pre>
            @else
                <p class="muted">UserInfo will appear here after a successful token exchange.</p>
            @endif
        </article>

        <article class="panel">
            <div class="panel-header">
                <div>
                    <span class="eyebrow">Webhook listener</span>
                    <h3>Server endpoint</h3>
                </div>
            </div>
            <p class="muted">
                POST JSON to the configured webhook path with the configured API key header. Incoming events are logged
                to <code>storage/logs/laravel.log</code> and acknowledged as JSON.
            </p>
            <pre class="code-block">curl -X POST "{{ $configSummary['Webhook path'] }}" \
  -H "{{ $configSummary['Webhook API header'] }}: &lt;api-key&gt;" \
  -H "Content-Type: application/json" \
  -d '{"event":"tenant.user.created"}'</pre>
        </article>
    </section>
@endsection
