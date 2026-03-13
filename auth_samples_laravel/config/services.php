<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'tuurio' => [
        'issuer' => env('TUURIO_ISSUER', 'https://test.id.tuurio.com'),
        'client_id' => env('TUURIO_CLIENT_ID', ''),
        'client_secret' => env('TUURIO_CLIENT_SECRET', ''),
        'redirect_uri' => env('TUURIO_REDIRECT_URI', 'http://localhost:8000/auth/callback'),
        'post_logout_redirect_uri' => env('TUURIO_POST_LOGOUT_REDIRECT_URI', 'http://localhost:8000/logout/callback'),
        'scope' => env('TUURIO_SCOPE', 'openid profile email'),
        'webhook_id' => env('TUURIO_WEBHOOK_ID', ''),
        'webhook_url' => env('TUURIO_WEBHOOK_URL', ''),
        'webhook_edit_url' => env('TUURIO_WEBHOOK_EDIT_URL', ''),
        'webhook_signing_secret' => env('TUURIO_WEBHOOK_SIGNING_SECRET', ''),
        'webhook_listen_path' => env('TUURIO_WEBHOOK_LISTEN_PATH', '/webhooks/tuurio'),
        'webhook_api_key_header' => env('TUURIO_WEBHOOK_API_KEY_HEADER', 'X-Tuurio-Webhook-Key'),
        'webhook_api_key' => env('TUURIO_WEBHOOK_API_KEY', ''),
    ],

];
