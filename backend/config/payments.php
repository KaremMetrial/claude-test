<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Active online gateway
    |--------------------------------------------------------------------------
    | Which gateway processes "card" / online payments. Use "offline" for local
    | development and demos (it simulates an instant successful payment), and
    | "stripe" in production once your Stripe keys are configured.
    */
    'default' => env('PAYMENT_GATEWAY', 'offline'),

    /*
    |--------------------------------------------------------------------------
    | Checkout payment methods
    |--------------------------------------------------------------------------
    | Offered to the customer at checkout. "cod" is fulfilled offline (cash on
    | delivery); "card" is routed to the active online gateway above.
    */
    'methods' => ['cod', 'card'],

    'gateways' => [

        'offline' => [
            'label' => 'Test / demo payment',
            'enabled' => true,
        ],

        'stripe' => [
            'label' => 'Credit / debit card',
            // Auto-enabled when a secret key is present.
            'enabled' => (bool) env('STRIPE_SECRET'),
            'key' => env('STRIPE_KEY'),
            'secret' => env('STRIPE_SECRET'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        ],

    ],

    /*
    | Where Stripe (or the demo gateway) sends the buyer back to after paying.
    */
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

];
