<?php

/**
 * Tuurio Auth Studio — Front controller (Apache).
 *
 * Apache mod_rewrite routes all non-file requests here.
 * The PHP built-in dev server uses router.php instead.
 *
 * @author  Tuurio GmbH, Berlin
 * @version 1.0.0 (2026-03-07)
 * @see     https://id.tuurio.com
 */

declare(strict_types=1);

// ── Front Controller ─────────────────────────────────────────
// Apache mod_rewrite routes all non-file requests here.
// The PHP built-in dev server uses router.php instead.
//
// This is the standard pattern used by Laravel, Symfony, Slim,
// and virtually every modern PHP application. All routing logic
// lives in PHP — no server-specific rewrite rules needed.

require_once __DIR__ . '/../src/helpers.php';

$uri   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$base  = base_path();
$route = ($base !== '' && str_starts_with($uri, $base))
    ? substr($uri, strlen($base))
    : $uri;
$route = '/' . ltrim($route, '/');
if ($route !== '/' && str_ends_with($route, '/')) {
    $route = rtrim($route, '/');
}

// OAuth callback fallback: code/error params on root indicate a
// misconfigured redirect_uri — handle gracefully.
if ($route === '/' && (isset($_GET['code']) || isset($_GET['error']))) {
    require __DIR__ . '/auth/callback/index.php';
    return;
}

// ── Route table ──────────────────────────────────────────────
$handler = match ($route) {
    '/', '/index.php'  => __DIR__ . '/home.php',
    '/login'           => __DIR__ . '/login.php',
    '/logout'          => __DIR__ . '/logout.php',
    '/auth/callback'   => __DIR__ . '/auth/callback/index.php',
    '/logout/callback' => __DIR__ . '/logout/callback/index.php',
    default            => null,
};

if ($handler !== null) {
    require $handler;
    return;
}

// ── Dynamic routes ───────────────────────────────────────────
// Webhook path is configurable via TUURIO_WEBHOOK_LISTEN_PATH
// and conventionally lives under /webhooks/.
if (str_starts_with($route, '/webhooks/')) {
    require __DIR__ . '/webhook.php';
    return;
}

// ── 404 ──────────────────────────────────────────────────────
http_response_code(404);
require __DIR__ . '/404.php';
