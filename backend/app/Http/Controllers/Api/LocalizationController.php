<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Language;
use App\Services\CurrencyService;
use Illuminate\Http\JsonResponse;

class LocalizationController extends Controller
{
    /**
     * Bootstrap payload the clients fetch on startup: available languages,
     * currencies, and the currently resolved locale/currency.
     */
    public function __invoke(CurrencyService $currency): JsonResponse
    {
        return response()->json([
            'languages' => Language::active()->orderBy('sort_order')->get()
                ->map(fn (Language $l) => [
                    'code' => $l->code,
                    'name' => $l->name,
                    'native_name' => $l->native_name,
                    'is_rtl' => $l->is_rtl,
                ]),
            'currencies' => Currency::active()->get()
                ->map(fn (Currency $c) => [
                    'code' => $c->code,
                    'name' => $c->name,
                    'symbol' => $c->symbol,
                    'symbol_position' => $c->symbol_position,
                ]),
            'active_locale' => app()->getLocale(),
            'active_currency' => $currency->active()->code,
        ]);
    }
}
