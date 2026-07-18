<?php

namespace App\Services\Payments;

/**
 * Uniform result returned by every gateway's pay() call, so the API and
 * front-end can treat all gateways the same way:
 *
 *  - $redirectUrl: where to send the browser next (Stripe hosted Checkout, or
 *    our own order page for instantly-settled/demo gateways).
 *  - $status: 'paid' when settled immediately (offline/demo), otherwise 'pending'
 *    while the customer completes payment on the gateway.
 */
class PaymentResult
{
    public function __construct(
        public readonly string $gateway,
        public readonly string $status,
        public readonly string $redirectUrl,
        public readonly ?string $reference = null,
    ) {
    }

    public function toArray(): array
    {
        return [
            'gateway' => $this->gateway,
            'status' => $this->status,
            'redirect_url' => $this->redirectUrl,
            'reference' => $this->reference,
        ];
    }
}
