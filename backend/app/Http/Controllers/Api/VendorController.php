<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VendorController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $vendors = Vendor::query()
            ->approved()
            ->withCount('products')
            ->orderByDesc('rating')
            ->paginate(12);

        return VendorResource::collection($vendors);
    }

    public function show(string $slug): VendorResource
    {
        $vendor = Vendor::query()
            ->approved()
            ->withCount('products')
            ->where('slug', $slug)
            ->firstOrFail();

        return new VendorResource($vendor);
    }

    public function products(string $slug): AnonymousResourceCollection
    {
        $vendor = Vendor::approved()->where('slug', $slug)->firstOrFail();

        $products = $vendor->products()
            ->active()
            ->with(['translations', 'vendor', 'category.translations'])
            ->latest()
            ->paginate(12);

        return ProductResource::collection($products);
    }
}
