<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'symbol_position',
        'exchange_rate',
        'decimal_places',
        'is_active',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'exchange_rate' => 'decimal:6',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Format an amount (already in this currency) for display.
     */
    public function format(float $amount): string
    {
        $number = number_format($amount, (int) $this->decimal_places);

        return $this->symbol_position === 'after'
            ? "{$number}{$this->symbol}"
            : "{$this->symbol}{$number}";
    }
}
