<?php

declare(strict_types=1);

session_start();

$config = require __DIR__ . '/../src/config.php';
require __DIR__ . '/../src/oauth.php';

$state = generate_random_string(32);
$verifier = generate_random_string(64);

$_SESSION['oauth'] = [
    'state' => $state,
    'verifier' => $verifier,
];

$authorizeUrl = build_authorize_url($config, $state, $verifier);

header('Location: ' . $authorizeUrl, true, 302);
exit;
