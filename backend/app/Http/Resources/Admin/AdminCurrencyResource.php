<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Currency
 */
class AdminCurrencyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'symbol' => $this->symbol,
            'symbol_position' => $this->symbol_position,
            'exchange_rate' => (float) $this->exchange_rate,
            'decimal_places' => $this->decimal_places,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
        ];
    }
}
