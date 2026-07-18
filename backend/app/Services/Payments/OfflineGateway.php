<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;
use Illuminate\Http\Request;

/**
 * Demo / test gateway.
 *
 * Simulates an instantly-successful card payment so the full checkout flow can
 * be exercised locally and by buyers who haven't configured Stripe yet. Never
 * use this in production — switch PAYMENT_GATEWAY=stripe instead.
 */
class OfflineGateway implements PaymentGateway
{
    public function key(): string
    {
        return 'offline';
    }

    public function pay(Order $order, Payment $payment): PaymentResult
    {
        $url = rtrim((string) config('payments.frontend_url'), '/')
            ."/orders?placed={$order->number}&paid=1";

        // Settled immediately; PaymentManager will flip the order to paid.
        return new PaymentResult(
            gateway: $this->key(),
            status: Payment::STATUS_PAID,
            redirectUrl: $url,
            reference: 'demo_'.$payment->id,
        );
    }

    public function handleWebhook(Request $request): void
    {
        // No asynchronous callbacks for the demo gateway.
    }
}
