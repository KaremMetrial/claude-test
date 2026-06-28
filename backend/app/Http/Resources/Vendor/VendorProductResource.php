<?php

namespace App\Http\Resources\Vendor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Management-facing product payload for the vendor dashboard.
 *
 * Unlike the storefront ProductResource (which returns a single translated
 * name + converted price), this returns the raw price and ALL translations
 * keyed by locale, so the edit form can populate every language tab.
 *
 * @mixin \App\Models\Product
 */
class VendorProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'category_id' => $this->category_id,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'currency' => $this->currency,
            'stock' => $this->stock,
            'in_stock' => $this->in_stock,
            'thumbnail' => $this->thumbnail,
            'rating' => (float) $this->rating,
            'total_reviews' => $this->total_reviews,
            'total_sales' => $this->total_sales,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            // translations as { en: {...}, ar: {...}, fr: {...} }
            'translations' => $this->whenLoaded('translations', fn () => $this->translations->keyBy('locale')->map(fn ($t) => [
                'name' => $t->name,
                'short_description' => $t->short_description,
                'description' => $t->description,
            ])),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($i) => [
                'id' => $i->id,
                'url' => $i->url,
                'alt' => $i->alt,
                'sort_order' => $i->sort_order,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
