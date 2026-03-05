<?php

declare(strict_types=1);

$env = loadEnv(__DIR__ . '/../.env');

$authority = normalizeAuthority(envValue($env, 'TUURIO_ISSUER')) ?? 'https://test.id.tuurio.com';
$clientId = sanitizeClientId(envValue($env, 'TUURIO_CLIENT_ID')) ?? 'php-KQD8';
$scope = sanitizeScope(envValue($env, 'TUURIO_SCOPE')) ?? 'openid profile email';

return [
    'authority' => $authority,
    'authorize_endpoint' => $authority . '/oauth2/authorize',
    'token_endpoint' => $authority . '/oauth2/token',
    'discovery_endpoint' => $authority . '/.well-known/openid-configuration',
    'client_id' => $clientId,
    'client_secret' => envValue($env, 'TUURIO_CLIENT_SECRET') ?? '',
    'redirect_uri' => normalizeUrl(envValue($env, 'TUURIO_REDIRECT_URI')) ?? 'http://localhost:8080/auth/callback',
    'post_logout_redirect_uri' => normalizeUrl(envValue($env, 'TUURIO_POST_LOGOUT_REDIRECT_URI')) ?? 'http://localhost:8080/',
    'scope' => $scope,
];

function loadEnv(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $separator = strpos($trimmed, '=');
        if ($separator === false || $separator === 0) {
            continue;
        }

        $key = trim(substr($trimmed, 0, $separator));
        $value = trim(substr($trimmed, $separator + 1));
        $values[$key] = stripEnvQuotes($value);
    }

    return $values;
}

function stripEnvQuotes(string $value): string
{
    if ($value === '') {
        return '';
    }

    $first = $value[0];
    $last = $value[strlen($value) - 1];
    if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
        return substr($value, 1, -1);
    }

    return $value;
}

function envValue(array $env, string $key): ?string
{
    $value = $env[$key] ?? getenv($key);
    if ($value === false) {
        return null;
    }

    $trimmed = trim((string) $value);
    return $trimmed === '' ? null : $trimmed;
}

function normalizeAuthority(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $parts = parse_url($value);
    if (!is_array($parts)) {
        return null;
    }

    $scheme = $parts['scheme'] ?? null;
    $host = $parts['host'] ?? null;
    if (!in_array($scheme, ['http', 'https'], true) || $host === null) {
        return null;
    }

    $port = isset($parts['port']) ? ':' . $parts['port'] : '';
    return $scheme . '://' . $host . $port;
}

function normalizeUrl(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $parts = parse_url($value);
    if (!is_array($parts)) {
        return null;
    }

    $scheme = $parts['scheme'] ?? null;
    $host = $parts['host'] ?? null;
    if (!in_array($scheme, ['http', 'https'], true) || $host === null) {
        return null;
    }

    return $value;
}

function sanitizeClientId(?string $value): ?string
{
    if ($value === null || strlen($value) > 120) {
        return null;
    }

    return preg_match('/^[A-Za-z0-9._-]+$/', $value) === 1 ? $value : null;
}

function sanitizeScope(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $parts = preg_split('/\s+/', trim($value)) ?: [];
    $filtered = [];
    foreach ($parts as $part) {
        if ($part !== '' && preg_match('/^[A-Za-z0-9._:-]+$/', $part) === 1) {
            $filtered[] = $part;
        }
    }

    if ($filtered === []) {
        return null;
    }

    return implode(' ', $filtered);
}
