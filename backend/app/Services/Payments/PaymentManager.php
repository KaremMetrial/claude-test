<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Central entry point for online payments: resolves the configured gateway,
 * opens a payment for an order, and settles orders (and their per-vendor
 * sub-orders) once a gateway reports success.
 */
class PaymentManager
{
    /**
     * Resolve a gateway instance by key (defaults to the configured gateway).
     */
    public function gateway(?string $key = null): PaymentGateway
    {
        $key = $key ?: (string) config('payments.default', 'offline');

        return match ($key) {
            'offline' => new OfflineGateway(),
            'stripe' => new StripeGateway(),
            default => throw new InvalidArgumentException("Unknown payment gateway [{$key}]."),
        };
    }

    /**
     * Open (or reuse) a payment for an order and hand off to the gateway.
     */
    public function start(Order $order): PaymentResult
    {
        $gateway = $this->gateway();

        $payment = $order->payments()->create([
            'gateway' => $gateway->key(),
            'status' => Payment::STATUS_PENDING,
            'amount' => $order->grand_total,
            'currency' => $order->currency,
        ]);

        $result = $gateway->pay($order, $payment);

        $payment->update(['reference' => $result->reference]);

        // Demo/offline gateways settle instantly; markPaid flips payment + order.
        // Pending gateways (Stripe) settle later via the webhook.
        if ($result->status === Payment::STATUS_PAID) {
            $this->markPaid($payment);
        }

        return $result;
    }

    /**
     * Settle a payment and flip its order (+ sub-orders) to paid.
     */
    public function markPaid(Payment $payment, array $payload = []): void
    {
        if ($payment->isPaid()) {
            return;
        }

        DB::transaction(function () use ($payment, $payload) {
            $payment->update([
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
                'payload' => $payload ?: $payment->payload,
            ]);

            $order = $payment->order;
            $order->update([
                'payment_status' => 'paid',
                'status' => Order::STATUS_PROCESSING,
            ]);

            // Propagate to the per-vendor sub-orders.
            $order->subOrders()->update([
                'payment_status' => 'paid',
                'status' => Order::STATUS_PROCESSING,
            ]);
        });
    }

    /**
     * Find a pending payment by its gateway reference (used by webhooks).
     */
    public function findByReference(string $reference): ?Payment
    {
        return Payment::where('reference', $reference)->first();
    }
}
