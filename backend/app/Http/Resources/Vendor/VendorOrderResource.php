<?php

namespace App\Http\Resources\Vendor;

use App\Http\Resources\OrderItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A vendor's view of one of their sub-orders, including buyer + line items.
 *
 * @mixin \App\Models\Order
 */
class VendorOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'currency' => $this->currency,
            'subtotal' => (float) $this->subtotal,
            'grand_total' => (float) $this->grand_total,
            'customer' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'shipping_address' => $this->shipping_address,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
