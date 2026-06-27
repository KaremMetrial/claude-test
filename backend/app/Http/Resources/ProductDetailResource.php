<?php

namespace App\Http\Resources;

use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full product payload for the product detail page (gallery + reviews + body).
 *
 * @mixin \App\Models\Product
 */
class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CurrencyService $currency */
        $currency = app(CurrencyService::class);
        $active = $currency->active();

        $price = $currency->convert((float) $this->price, $this->currency);
        $compareAt = $this->compare_at_price !== null
            ? $currency->convert((float) $this->compare_at_price, $this->currency)
            : null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'name' => $this->translate('name'),
            'short_description' => $this->translate('short_description'),
            'description' => $this->translate('description'),
            'thumbnail' => $this->thumbnail,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'price' => $price,
            'price_formatted' => $active->format($price),
            'compare_at_price' => $compareAt,
            'compare_at_price_formatted' => $compareAt !== null ? $active->format($compareAt) : null,
            'on_sale' => $this->isOnSale(),
            'currency' => $active->code,
            'in_stock' => $this->in_stock,
            'stock' => $this->stock,
            'rating' => (float) $this->rating,
            'total_reviews' => $this->total_reviews,
            'total_sales' => $this->total_sales,
            'is_featured' => $this->is_featured,
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
