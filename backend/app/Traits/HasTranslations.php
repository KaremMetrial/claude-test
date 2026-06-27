<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Lightweight translation helper for the "side table" pattern.
 *
 * A model using this trait stores translatable fields in a companion table
 * (e.g. Product -> product_translations) with one row per locale. Reads resolve
 * the active locale, then fall back to the app fallback locale, then to any
 * available translation — so the storefront never renders an empty string.
 */
trait HasTranslations
{
    public function translations(): HasMany
    {
        return $this->hasMany($this->translationModelClass(), $this->translationForeignKey());
    }

    /**
     * Resolve the best translation row for the given (or active) locale.
     */
    public function translation(?string $locale = null): ?Model
    {
        $locale = $locale ?: app()->getLocale();
        $fallback = (string) config('app.fallback_locale', 'en');

        // Use the eager-loaded collection when available to avoid extra queries.
        $translations = $this->relationLoaded('translations')
            ? $this->getRelation('translations')
            : $this->translations()->get();

        return $translations->firstWhere('locale', $locale)
            ?? $translations->firstWhere('locale', $fallback)
            ?? $translations->first();
    }

    /**
     * Get a single translated attribute with graceful fallback.
     */
    public function translate(string $attribute, ?string $locale = null): mixed
    {
        return optional($this->translation($locale))->{$attribute};
    }

    protected function translationModelClass(): string
    {
        return static::class.'Translation';
    }

    protected function translationForeignKey(): string
    {
        return Str::snake(class_basename(static::class)).'_id';
    }
}
