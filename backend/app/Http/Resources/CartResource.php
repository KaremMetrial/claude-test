<?php

namespace App\Http\Resources;

use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cart
 */
class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CurrencyService $currency */
        $currency = app(CurrencyService::class);
        $active = $currency->active();

        $items = $this->items->map(function ($item) use ($currency, $active) {
            $fromCurrency = $item->product?->currency ?? $active->code;
            $unit = $currency->convert((float) $item->unit_price, $fromCurrency);

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product?->translate('name'),
                'thumbnail' => $item->product?->thumbnail,
                'slug' => $item->product?->slug,
                'quantity' => $item->quantity,
                'unit_price' => $unit,
                'line_total' => round($unit * $item->quantity, $active->decimal_places),
            ];
        });

        $subtotal = round($items->sum('line_total'), $active->decimal_places);

        return [
            'id' => $this->id,
            'currency' => $active->code,
            'items' => $items,
            'item_count' => $items->sum('quantity'),
            'subtotal' => $subtotal,
            'subtotal_formatted' => $active->format($subtotal),
        ];
    }
}
