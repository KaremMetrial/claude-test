<?php

return [

    'name' => env('APP_NAME', 'Bazario'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost'),

    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Storefront Localization
    |--------------------------------------------------------------------------
    | These drive the multilingual + multi-currency behaviour of the API.
    */

    'supported_locales' => array_filter(
        explode(',', (string) env('APP_SUPPORTED_LOCALES', 'en,ar,fr'))
    ),

    'rtl_locales' => ['ar', 'he', 'fa', 'ur'],

    'default_currency' => env('APP_DEFAULT_CURRENCY', 'USD'),

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
