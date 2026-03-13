<?php

use App\Http\Controllers\TuurioAuthController;
use App\Http\Controllers\TuurioWebhookController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

$configuredWebhookPath = trim((string) config('services.tuurio.webhook_listen_path', '/webhooks/tuurio'));
$webhookPath = '/' . ltrim($configuredWebhookPath, '/');

Route::get('/', [TuurioAuthController::class, 'home'])->name('home');
Route::get('/login', [TuurioAuthController::class, 'login'])->name('login');
Route::get('/auth/callback', [TuurioAuthController::class, 'callback'])->name('auth.callback');
Route::get('/logout', [TuurioAuthController::class, 'logout'])->name('logout');
Route::get('/logout/callback', [TuurioAuthController::class, 'logoutCallback'])->name('logout.callback');

Route::post($webhookPath, TuurioWebhookController::class)
    ->withoutMiddleware([ValidateCsrfToken::class])
    ->name('webhook.receive');
