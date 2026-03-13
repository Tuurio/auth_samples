<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Support\TuurioOidcService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Throwable;

class TuurioAuthController extends Controller
{
    public function __construct(
        private readonly TuurioOidcService $oidc,
    ) {
    }

    public function home(Request $request): View
    {
        $config = $this->oidc->config();
        $tokens = $request->session()->get('tuurio.tokens', []);
        $userInfo = $request->session()->get('tuurio.userinfo', []);

        return view('home', [
            'statusLabel' => $request->session()->has('tuurio.tokens.access_token') ? 'Authenticated' : 'Ready',
            'statusTone' => $request->session()->has('tuurio.tokens.access_token') ? 'good' : 'neutral',
            'authorityHost' => parse_url($config['authority'], PHP_URL_HOST) ?: $config['authority'],
            'configSummary' => [
                'Authority' => $config['authority'],
                'Client ID' => $config['client_id'],
                'Redirect URI' => $config['redirect_uri'],
                'Post-logout URI' => $config['post_logout_redirect_uri'],
                'Webhook path' => $config['webhook_listen_path'],
                'Webhook edit URL' => $config['webhook_edit_url'],
                'Webhook API header' => $config['webhook_api_key_header'],
            ],
            'userInfo' => $userInfo,
            'userInfoJson' => $this->prettyJson($userInfo),
            'idTokenJson' => $this->prettyJson($this->oidc->decodeJwt($tokens['id_token'] ?? null)),
            'accessTokenJson' => $this->prettyJson($this->oidc->decodeJwt($tokens['access_token'] ?? null)),
            'errorMessage' => $request->session()->pull('tuurio.error'),
            'successMessage' => $request->session()->pull('tuurio.success'),
            'isAuthenticated' => $request->session()->has('tuurio.tokens.access_token'),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $state = $this->oidc->generateRandomString();
        $verifier = $this->oidc->generateRandomString(64);

        $request->session()->put('tuurio.oauth_state', $state);
        $request->session()->put('tuurio.oauth_verifier', $verifier);

        return redirect()->away($this->oidc->buildAuthorizeUrl($state, $verifier));
    }

    public function callback(Request $request): RedirectResponse
    {
        $expectedState = (string) $request->session()->pull('tuurio.oauth_state', '');
        $verifier = (string) $request->session()->pull('tuurio.oauth_verifier', '');

        if ($request->filled('error')) {
            $message = trim((string) $request->query('error_description', $request->query('error', 'Authentication failed.')));
            $request->session()->put('tuurio.error', $message);

            return redirect()->route('home');
        }

        if ($expectedState === '' || $verifier === '' || ! hash_equals($expectedState, (string) $request->query('state', ''))) {
            $request->session()->put('tuurio.error', 'Invalid OAuth state. Start the login flow again.');

            return redirect()->route('home');
        }

        $code = trim((string) $request->query('code', ''));
        if ($code === '') {
            $request->session()->put('tuurio.error', 'Authorization code missing.');

            return redirect()->route('home');
        }

        try {
            $tokens = $this->oidc->exchangeCodeForTokens($code, $verifier);
            $userInfo = [];
            if (! empty($tokens['access_token'])) {
                $userInfo = $this->oidc->fetchUserInfo((string) $tokens['access_token']);
            }

            $request->session()->put('tuurio.tokens', $tokens);
            $request->session()->put('tuurio.userinfo', $userInfo);
            $request->session()->put('tuurio.success', 'Authentication successful. Tokens stored in the Laravel session.');
        } catch (Throwable $exception) {
            $request->session()->put('tuurio.error', $exception->getMessage() ?: 'Token exchange failed.');
        }

        return redirect()->route('home');
    }

    public function logout(Request $request): RedirectResponse
    {
        $logoutUrl = $this->oidc->buildEndSessionUrl();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->away($logoutUrl);
    }

    public function logoutCallback(): View
    {
        return view('auth.logout-callback');
    }

    private function prettyJson(mixed $value): ?string
    {
        if ($value === null || $value === [] || $value === '') {
            return null;
        }

        return json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}
