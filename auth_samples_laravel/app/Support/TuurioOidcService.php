<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class TuurioOidcService
{
    public function config(): array
    {
        $issuer = $this->normalizeAuthority((string) config('services.tuurio.issuer', 'https://test.id.tuurio.com'));

        return [
            'authority' => $issuer,
            'authorize_endpoint' => $issuer . '/oauth2/authorize',
            'token_endpoint' => $issuer . '/oauth2/token',
            'discovery_endpoint' => $issuer . '/.well-known/openid-configuration',
            'client_id' => trim((string) config('services.tuurio.client_id', '')),
            'client_secret' => trim((string) config('services.tuurio.client_secret', '')),
            'redirect_uri' => trim((string) config('services.tuurio.redirect_uri', 'http://localhost:8000/auth/callback')),
            'post_logout_redirect_uri' => trim((string) config('services.tuurio.post_logout_redirect_uri', 'http://localhost:8000/logout/callback')),
            'scope' => trim((string) config('services.tuurio.scope', 'openid profile email')),
            'webhook_id' => trim((string) config('services.tuurio.webhook_id', '')),
            'webhook_url' => trim((string) config('services.tuurio.webhook_url', '')),
            'webhook_edit_url' => trim((string) config('services.tuurio.webhook_edit_url', '')),
            'webhook_signing_secret' => trim((string) config('services.tuurio.webhook_signing_secret', '')),
            'webhook_listen_path' => $this->normalizeWebhookPath((string) config('services.tuurio.webhook_listen_path', '/webhooks/tuurio')),
            'webhook_api_key_header' => trim((string) config('services.tuurio.webhook_api_key_header', 'X-Tuurio-Webhook-Key')),
            'webhook_api_key' => trim((string) config('services.tuurio.webhook_api_key', '')),
        ];
    }

    public function generateRandomString(int $bytes = 32): string
    {
        return $this->base64UrlEncode(random_bytes($bytes));
    }

    public function buildAuthorizeUrl(string $state, string $verifier): string
    {
        $config = $this->config();
        $params = http_build_query([
            'client_id' => $config['client_id'],
            'redirect_uri' => $config['redirect_uri'],
            'response_type' => 'code',
            'scope' => $config['scope'],
            'state' => $state,
            'code_challenge' => $this->pkceChallenge($verifier),
            'code_challenge_method' => 'S256',
        ]);

        return $config['authorize_endpoint'] . '?' . $params;
    }

    public function exchangeCodeForTokens(string $code, string $verifier): array
    {
        $config = $this->config();

        $request = Http::asForm()
            ->timeout(15)
            ->acceptJson();

        if ($config['client_secret'] !== '') {
            $request = $request->withBasicAuth($config['client_id'], $config['client_secret']);
        }

        $response = $request->post($config['token_endpoint'], [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $config['redirect_uri'],
            'client_id' => $config['client_id'],
            'code_verifier' => $verifier,
        ]);

        if (! $response->successful()) {
            throw new RuntimeException('Token request failed: ' . $response->body());
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            throw new RuntimeException('Unable to parse token response.');
        }

        return $payload;
    }

    public function fetchDiscovery(): array
    {
        $config = $this->config();

        return Cache::remember(
            'tuurio.discovery.' . sha1($config['authority']),
            now()->addMinutes(30),
            function () use ($config): array {
                $response = Http::timeout(10)->acceptJson()->get($config['discovery_endpoint']);
                if (! $response->successful()) {
                    throw new RuntimeException('Unable to load discovery document.');
                }

                $payload = $response->json();
                if (! is_array($payload)) {
                    throw new RuntimeException('Invalid discovery document.');
                }

                return $payload;
            }
        );
    }

    public function fetchUserInfo(string $accessToken): array
    {
        $endpoint = $this->fetchDiscovery()['userinfo_endpoint'] ?? null;
        if (! is_string($endpoint) || trim($endpoint) === '') {
            throw new RuntimeException('Discovery document has no userinfo_endpoint.');
        }

        $response = Http::timeout(10)
            ->acceptJson()
            ->withToken($accessToken)
            ->get($endpoint);

        if (! $response->successful()) {
            throw new RuntimeException('UserInfo request failed: ' . $response->body());
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            throw new RuntimeException('Unable to parse UserInfo response.');
        }

        return $payload;
    }

    public function decodeJwt(?string $token): ?array
    {
        $raw = trim((string) $token);
        if ($raw === '') {
            return null;
        }

        $parts = explode('.', $raw);
        if (count($parts) < 2) {
            return null;
        }

        $decoded = json_decode($this->base64UrlDecode($parts[1]), true);

        return is_array($decoded) ? $decoded : null;
    }

    public function buildEndSessionUrl(): string
    {
        $config = $this->config();
        $fallback = $config['post_logout_redirect_uri'];

        try {
            $discovery = $this->fetchDiscovery();
        } catch (\Throwable) {
            return $fallback;
        }

        $endpoint = $discovery['end_session_endpoint'] ?? null;
        if (! is_string($endpoint) || trim($endpoint) === '') {
            return $fallback;
        }

        return $endpoint . '?' . http_build_query([
            'client_id' => $config['client_id'],
            'post_logout_redirect_uri' => $config['post_logout_redirect_uri'],
        ]);
    }

    private function normalizeAuthority(string $value): string
    {
        $normalized = trim($value);
        if ($normalized === '') {
            return 'https://test.id.tuurio.com';
        }

        return rtrim($normalized, '/');
    }

    private function normalizeWebhookPath(string $value): string
    {
        $normalized = '/' . ltrim(trim($value), '/');

        return $normalized === '/' ? '/webhooks/tuurio' : $normalized;
    }

    private function pkceChallenge(string $verifier): string
    {
        return $this->base64UrlEncode(hash('sha256', $verifier, true));
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }
}
