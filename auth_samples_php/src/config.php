<?php

declare(strict_types=1);

return [
    'authority' => 'https://test.id.tuurio.com',
    'authorize_endpoint' => 'https://test.id.tuurio.com/oauth2/authorize',
    'token_endpoint' => 'https://test.id.tuurio.com/oauth2/token',
    'discovery_endpoint' => 'https://test.id.tuurio.com/.well-known/openid-configuration',
    'client_id' => 'php-KQD8',
    // Client secret is optional and loaded from env when available.
    'client_secret' => getenv('TUURIO_ID_SECRET') ?: '',
    'redirect_uri' => 'http://localhost:8080/auth/callback',
    'post_logout_redirect_uri' => 'http://localhost:8080/',
    'scope' => 'openid profile email',
];
