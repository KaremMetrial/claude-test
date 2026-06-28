<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Vendor
 */
class AdminVendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'slug' => $this->slug,
            'status' => $this->status,
            'base_currency' => $this->base_currency,
            'commission_rate' => (float) $this->commission_rate,
            'rating' => (float) $this->rating,
            'total_reviews' => $this->total_reviews,
            'city' => $this->city,
            'country' => $this->country,
            'products_count' => $this->whenCounted('products'),
            'owner' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
