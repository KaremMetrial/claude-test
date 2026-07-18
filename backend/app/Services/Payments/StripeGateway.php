<?php

namespace App\Services\Payments;

use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\Contracts\PaymentGateway;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Stripe gateway using hosted Checkout Sessions.
 *
 * pay() creates a Checkout Session and returns its hosted URL; the customer
 * completes payment on Stripe, then Stripe calls our webhook
 * (checkout.session.completed) which settles the matching order.
 *
 * Requires `composer require stripe/stripe-php` and these env vars:
 *   STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET
 */
class StripeGateway implements PaymentGateway
{
    public function key(): string
    {
        return 'stripe';
    }

    public function pay(Order $order, Payment $payment): PaymentResult
    {
        $client = $this->client();
        $frontend = rtrim((string) config('payments.frontend_url'), '/');

        $session = $client->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($order->currency),
                    'product_data' => ['name' => "Order {$order->number}"],
                    'unit_amount' => $this->smallestUnit((float) $order->grand_total, $order->currency),
                ],
                'quantity' => 1,
            ]],
            'success_url' => "{$frontend}/orders?placed={$order->number}&paid=1&session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "{$frontend}/checkout?cancelled=1",
            'client_reference_id' => $order->number,
            'metadata' => ['order_id' => $order->id, 'payment_id' => $payment->id],
        ]);

        return new PaymentResult(
            gateway: $this->key(),
            status: Payment::STATUS_PENDING,
            redirectUrl: $session->url,
            reference: $session->id,
        );
    }

    public function handleWebhook(Request $request): void
    {
        $secret = config('payments.gateways.stripe.webhook_secret');

        if (! class_exists(\Stripe\Webhook::class) || ! $secret) {
            throw new RuntimeException('Stripe webhook is not configured.');
        }

        // Throws SignatureVerificationException on tampering.
        $event = \Stripe\Webhook::constructEvent(
            $request->getContent(),
            (string) $request->header('Stripe-Signature'),
            $secret,
        );

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $payment = app(PaymentManager::class)->findByReference($session->id);

            if ($payment) {
                app(PaymentManager::class)->markPaid($payment, ['stripe_event' => $event->id]);
            }
        }
    }

    private function client(): \Stripe\StripeClient
    {
        $secret = config('payments.gateways.stripe.secret');

        if (! class_exists(\Stripe\StripeClient::class)) {
            throw new RuntimeException('The stripe/stripe-php package is not installed. Run: composer require stripe/stripe-php');
        }

        if (! $secret) {
            throw new RuntimeException('STRIPE_SECRET is not set.');
        }

        return new \Stripe\StripeClient($secret);
    }

    /**
     * Convert a decimal amount into the currency's smallest unit (e.g. cents).
     */
    private function smallestUnit(float $amount, string $code): int
    {
        $decimals = Currency::where('code', $code)->value('decimal_places') ?? 2;

        return (int) round($amount * (10 ** $decimals));
    }
}
