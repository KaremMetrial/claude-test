<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Paginated, filterable catalog feed.
     *
     * Query params: q, category, vendor, featured, min_price, max_price,
     * sort (newest|price_asc|price_desc|popular|rating), per_page.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->active()
            ->with(['translations', 'vendor', 'category.translations'])
            ->search($request->query('q'));

        if ($slug = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
        }

        if ($vendor = $request->query('vendor')) {
            $query->whereHas('vendor', fn ($q) => $q->where('slug', $vendor));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        match ($request->query('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('total_sales'),
            'rating' => $query->orderByDesc('rating'),
            default => $query->latest(),
        };

        $perPage = min((int) $request->query('per_page', 12), 48);

        return ProductResource::collection($query->paginate($perPage)->withQueryString());
    }

    public function show(string $slug): ProductDetailResource
    {
        $product = Product::query()
            ->active()
            ->with([
                'translations',
                'vendor',
                'category.translations',
                'images',
                'reviews' => fn ($q) => $q->where('is_approved', true)->latest()->limit(20),
                'reviews.user',
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductDetailResource($product);
    }
}
