<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Category
 */
class AdminCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'icon' => $this->icon,
            'image' => $this->image,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'products_count' => $this->whenCounted('products'),
            'translations' => $this->whenLoaded('translations', fn () => $this->translations->keyBy('locale')->map(fn ($t) => [
                'name' => $t->name,
                'description' => $t->description,
            ])),
        ];
    }
}
