<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route is already guarded by auth + role:vendor middleware.
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;
        $supported = (array) config('app.supported_locales', ['en']);
        $fallback = (string) config('app.fallback_locale', 'en');

        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:64', Rule::unique('products', 'sku')->ignore($productId)],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'currency' => ['required', 'string', 'size:3'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'thumbnail' => ['nullable', 'url', 'max:2048'],

            // Translations: the fallback locale's name is required; others optional.
            'translations' => ['required', 'array'],
            "translations.{$fallback}.name" => ['required', 'string', 'max:255'],
            'translations.*.name' => ['nullable', 'string', 'max:255'],
            'translations.*.short_description' => ['nullable', 'string', 'max:500'],
            'translations.*.description' => ['nullable', 'string', 'max:20000'],

            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['url', 'max:2048'],
        ];
    }

    /**
     * Keep only translations for supported locales.
     */
    public function translations(): array
    {
        $supported = (array) config('app.supported_locales', ['en']);

        return collect($this->input('translations', []))
            ->only($supported)
            ->filter(fn ($t) => ! empty($t['name']))
            ->toArray();
    }
}
