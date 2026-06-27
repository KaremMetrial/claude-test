<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, string $slug): JsonResponse
    {
        $product = Product::active()->where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:120'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = Review::updateOrCreate(
            ['product_id' => $product->id, 'user_id' => $request->user()->id],
            $data + ['is_approved' => true]
        );

        // Recalculate the product's aggregate rating.
        $this->recalculateRating($product);

        return response()->json([
            'message' => __('Thank you for your review.'),
            'data' => (new ReviewResource($review->load('user')))->resolve(),
        ], 201);
    }

    private function recalculateRating(Product $product): void
    {
        $stats = $product->reviews()->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        $product->update([
            'rating' => round((float) $stats->avg_rating, 2),
            'total_reviews' => (int) $stats->total,
        ]);
    }
}
