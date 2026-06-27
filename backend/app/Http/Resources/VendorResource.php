<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Vendor
 */
class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'banner' => $this->banner,
            'city' => $this->city,
            'country' => $this->country,
            'rating' => (float) $this->rating,
            'total_reviews' => $this->total_reviews,
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
