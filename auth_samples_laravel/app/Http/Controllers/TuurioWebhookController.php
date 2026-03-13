<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TuurioWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $expectedHeader = trim((string) config('services.tuurio.webhook_api_key_header', 'X-Tuurio-Webhook-Key'));
        $expectedValue = trim((string) config('services.tuurio.webhook_api_key', ''));

        $providedValue = trim((string) $request->header($expectedHeader, ''));
        if ($expectedValue === '' || $providedValue === '' || ! hash_equals($expectedValue, $providedValue)) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid webhook API key header.',
            ], 401);
        }

        $payload = $request->json()->all();
        Log::info('Tuurio webhook received', [
            'headers' => [
                'x-tuurio-event' => $request->header('X-Tuurio-Event'),
                'x-tuurio-delivery' => $request->header('X-Tuurio-Delivery'),
            ],
            'payload' => $payload,
        ]);

        return response()->json([
            'ok' => true,
            'received' => true,
            'event' => $request->header('X-Tuurio-Event'),
            'delivery' => $request->header('X-Tuurio-Delivery'),
            'payload' => $payload,
        ]);
    }
}
