<?php

namespace App\Services;

use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Resolves the active storefront currency and converts amounts between
 * currencies using stored exchange rates (all rates are relative to the
 * platform base currency where rate = 1.0).
 */
class CurrencyService
{
    private ?Currency $active = null;

    public function __construct(private readonly Request $request)
    {
    }

    /**
     * All active currencies, cached for the request lifecycle.
     */
    public function all()
    {
        return Cache::remember('currencies.active', 300, fn () => Currency::active()->get());
    }

    /**
     * Determine the currency to render prices in.
     *
     * Resolution order: ?currency= / X-Currency header / authenticated user
     * preference / platform default.
     */
    public function active(): Currency
    {
        if ($this->active) {
            return $this->active;
        }

        $code = $this->request->query('currency')
            ?? $this->request->header('X-Currency')
            ?? optional($this->request->user())->preferred_currency
            ?? config('app.default_currency', 'USD');

        $currencies = $this->all();

        $this->active = $currencies->firstWhere('code', strtoupper((string) $code))
            ?? $currencies->firstWhere('is_default', true)
            ?? $currencies->first()
            ?? $this->fallbackCurrency();

        return $this->active;
    }

    /**
     * Convert an amount from a source currency code into the active currency.
     */
    public function convert(float $amount, string $fromCode): float
    {
        $from = $this->all()->firstWhere('code', strtoupper($fromCode));
        $to = $this->active();

        $fromRate = $from ? (float) $from->exchange_rate : 1.0;
        $toRate = (float) $to->exchange_rate;

        if ($fromRate <= 0) {
            $fromRate = 1.0;
        }

        // Normalise to base currency, then into the target currency.
        $base = $amount / $fromRate;

        return round($base * $toRate, (int) $to->decimal_places);
    }

    /**
     * Convert and format in one step (e.g. "$19.99").
     */
    public function display(float $amount, string $fromCode): string
    {
        return $this->active()->format($this->convert($amount, $fromCode));
    }

    private function fallbackCurrency(): Currency
    {
        return new Currency([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'symbol_position' => 'before',
            'exchange_rate' => 1,
            'decimal_places' => 2,
            'is_active' => true,
            'is_default' => true,
        ]);
    }
}
