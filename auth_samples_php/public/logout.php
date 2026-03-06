<?php

declare(strict_types=1);

session_start();

$config = require __DIR__ . '/../src/config.php';
require __DIR__ . '/../src/oauth.php';

try {
    $discovery = fetch_discovery($config);
    $endSession = $discovery['end_session_endpoint'] ?? null;
    if (!$endSession) {
        throw new RuntimeException('End session endpoint not found.');
    }

    unset($_SESSION['auth']);

    $params = [
        'client_id' => $config['client_id'],
        'post_logout_redirect_uri' => $config['post_logout_redirect_uri'],
    ];

    $url = $endSession . '?' . http_build_query($params);
    header('Location: ' . $url, true, 302);
    exit;
} catch (Throwable $exception) {
    $_SESSION['error'] = $exception->getMessage();
    header('Location: /', true, 302);
    exit;
}
