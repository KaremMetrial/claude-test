<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Platform-wide order view for the admin orders table.
 *
 * @mixin \App\Models\Order
 */
class AdminOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'currency' => $this->currency,
            'grand_total' => (float) $this->grand_total,
            'discount_total' => (float) $this->discount_total,
            'items_count' => $this->whenCounted('items'),
            'vendors_count' => $this->whenCounted('subOrders'),
            'customer' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
