<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payments\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Public payment configuration for the storefront (enabled methods +
     * active gateway + Stripe publishable key when configured).
     */
    public function config(): JsonResponse
    {
        $active = (string) config('payments.default', 'offline');

        return response()->json([
            'methods' => config('payments.methods', ['cod']),
            'gateway' => $active,
            'stripe_key' => config('payments.gateways.stripe.enabled')
                ? config('payments.gateways.stripe.key')
                : null,
        ]);
    }

    /**
     * Start an online payment for one of the authenticated user's orders.
     * Returns where to redirect the browser next (hosted Checkout or, for the
     * demo gateway, straight back to the paid order).
     */
    public function pay(Request $request, string $number, PaymentManager $payments): JsonResponse
    {
        $order = $request->user()->orders()
            ->whereNull('parent_id')
            ->where('number', $number)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => __('This order is already paid.')], 422);
        }

        try {
            $result = $payments->start($order);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $result->toArray()]);
    }

    /**
     * Gateway webhook (e.g. Stripe). No auth — authenticity is verified inside
     * the gateway via the signing secret.
     */
    public function webhook(Request $request, PaymentManager $payments): JsonResponse
    {
        try {
            $payments->gateway()->handleWebhook($request);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        return response()->json(['received' => true]);
    }
}
