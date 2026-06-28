<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Requests\Vendor\ProductRequest;
use App\Http\Resources\Vendor\VendorProductResource;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends VendorBaseController
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $vendor = $this->vendor($request);

        $query = $vendor->products()
            ->with(['translations', 'images'])
            ->latest();

        if ($search = $request->query('q')) {
            $query->whereHas('translations', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->boolean('status'));
        }

        return VendorProductResource::collection($query->paginate(15)->withQueryString());
    }

    public function show(Request $request, Product $product): VendorProductResource
    {
        $this->authorizeProduct($request, $product);

        return new VendorProductResource($product->load(['translations', 'images']));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $vendor = $this->vendor($request);
        $product = $this->save($request, $vendor, new Product(['vendor_id' => $vendor->id]));

        return response()->json([
            'message' => __('Product created.'),
            'data' => (new VendorProductResource($product->load(['translations', 'images'])))->resolve(),
        ], 201);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $vendor = $this->vendor($request);
        $this->authorizeProduct($request, $product);

        $product = $this->save($request, $vendor, $product);

        return response()->json([
            'message' => __('Product updated.'),
            'data' => (new VendorProductResource($product->load(['translations', 'images'])))->resolve(),
        ]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorizeProduct($request, $product);
        $product->delete();

        return response()->json(['message' => __('Product deleted.')]);
    }

    /**
     * Persist product attributes, translations and gallery in one transaction.
     */
    private function save(ProductRequest $request, Vendor $vendor, Product $product): Product
    {
        $translations = $request->translations();
        $fallback = (string) config('app.fallback_locale', 'en');
        $primaryName = $translations[$fallback]['name'] ?? reset($translations)['name'];

        return DB::transaction(function () use ($request, $vendor, $product, $translations, $primaryName) {
            $product->fill([
                'category_id' => $request->input('category_id'),
                'sku' => $request->input('sku'),
                'price' => $request->input('price'),
                'compare_at_price' => $request->input('compare_at_price'),
                'currency' => strtoupper($request->input('currency', $vendor->base_currency)),
                'stock' => $request->input('stock'),
                'in_stock' => (int) $request->input('stock') > 0,
                'thumbnail' => $request->input('thumbnail'),
                'is_active' => $request->boolean('is_active', true),
                'is_featured' => $request->boolean('is_featured', false),
            ]);

            $product->vendor_id = $vendor->id;

            if (! $product->slug) {
                $product->slug = $this->uniqueSlug($primaryName);
            }

            $product->save();

            // Upsert translations (replace fields for each provided locale).
            foreach ($translations as $locale => $fields) {
                $product->translations()->updateOrCreate(
                    ['locale' => $locale],
                    [
                        'name' => $fields['name'],
                        'short_description' => $fields['short_description'] ?? null,
                        'description' => $fields['description'] ?? null,
                    ]
                );
            }

            // Replace the gallery only when the client sends an images array.
            if ($request->has('images')) {
                $product->images()->delete();
                foreach ((array) $request->input('images', []) as $i => $url) {
                    $product->images()->create(['url' => $url, 'sort_order' => $i]);
                }
            }

            return $product;
        });
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $n = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$n);
        }

        return $slug;
    }

    private function authorizeProduct(Request $request, Product $product): void
    {
        $vendor = $this->vendor($request);
        abort_if($product->vendor_id !== $vendor->id, 403, __('This product belongs to another store.'));
    }
}
