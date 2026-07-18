<?php

namespace App\Services\Payments\Contracts;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\PaymentResult;
use Illuminate\Http\Request;

interface PaymentGateway
{
    /**
     * Machine name of the gateway (matches config('payments.gateways.*')).
     */
    public function key(): string;

    /**
     * Begin payment for an order. Returns where to send the customer next and
     * whether the payment is already settled (demo) or still pending (Stripe).
     */
    public function pay(Order $order, Payment $payment): PaymentResult;

    /**
     * Process an asynchronous gateway webhook (e.g. Stripe). Implementations
     * should verify authenticity and settle the matching payment/order.
     */
    public function handleWebhook(Request $request): void;
}
