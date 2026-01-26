<?php

declare(strict_types=1);

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function generate_random_string(int $length = 32): string
{
    return base64url_encode(random_bytes($length));
}

function pkce_challenge(string $verifier): string
{
    return base64url_encode(hash('sha256', $verifier, true));
}

function build_authorize_url(array $config, string $state, string $verifier): string
{
    $params = [
        'client_id' => $config['client_id'],
        'redirect_uri' => $config['redirect_uri'],
        'response_type' => 'code',
        'scope' => $config['scope'],
        'state' => $state,
        'code_challenge' => pkce_challenge($verifier),
        'code_challenge_method' => 'S256',
    ];

    return $config['authorize_endpoint'] . '?' . http_build_query($params);
}

function exchange_code_for_tokens(array $config, string $code, string $verifier): array
{
    $params = [
        'grant_type' => 'authorization_code',
        'code' => $code,
        'redirect_uri' => $config['redirect_uri'],
        'client_id' => $config['client_id'],
        'code_verifier' => $verifier,
    ];

    $clientSecret = $config['client_secret'] ?? '';

    $curlOptions = [];
    if ($clientSecret !== '') {
        $curlOptions[CURLOPT_HTTPAUTH] = CURLAUTH_BASIC;
        $curlOptions[CURLOPT_USERPWD] = $config['client_id'] . ':' . $clientSecret;
    }

    $payload = http_build_query($params);

    $ch = curl_init($config['token_endpoint']);
    $options = [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_RETURNTRANSFER => true,
    ];

    if ($curlOptions) {
        $options = $options + $curlOptions;
    }

    curl_setopt_array($ch, $options);

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException('Token request failed: ' . $error);
    }

    if ($status >= 400) {
        throw new RuntimeException('Token request failed: ' . $response);
    }

    $data = json_decode($response, true);
    if (!is_array($data)) {
        throw new RuntimeException('Unable to parse token response.');
    }

    return $data;
}

function fetch_discovery(array $config): array
{
    $response = file_get_contents($config['discovery_endpoint']);
    if ($response === false) {
        throw new RuntimeException('Unable to load discovery document.');
    }

    $data = json_decode($response, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid discovery document.');
    }

    return $data;
}

function decode_jwt(string $token): ?array
{
    if ($token === '') {
        return null;
    }

    $parts = explode('.', $token);
    if (count($parts) < 2) {
        return null;
    }

    $payload = json_decode(base64url_decode($parts[1]), true);
    return is_array($payload) ? $payload : null;
}

function format_time(?int $unixSeconds): string
{
    if (!$unixSeconds) {
        return 'unknown time';
    }
    return date('Y-m-d H:i:s', $unixSeconds);
}
