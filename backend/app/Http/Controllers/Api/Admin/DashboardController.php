<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Platform-wide metrics for the admin overview.
     */
    public function stats(): JsonResponse
    {
        // Parent orders represent one customer checkout (avoids double counting
        // the per-vendor sub-orders).
        $orders = Order::whereNull('parent_id');

        return response()->json([
            'data' => [
                'users_total' => User::count(),
                'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
                'vendors_total' => Vendor::count(),
                'vendors_pending' => Vendor::where('status', Vendor::STATUS_PENDING)->count(),
                'products_total' => Product::count(),
                'orders_total' => (clone $orders)->count(),
                'orders_today' => (clone $orders)->whereDate('created_at', today())->count(),
                'gmv' => round((float) (clone $orders)->sum('grand_total'), 2),
                'revenue_paid' => round((float) (clone $orders)->where('payment_status', 'paid')->sum('grand_total'), 2),
                'top_vendors' => Vendor::query()
                    ->withCount('products')
                    ->orderByDesc('rating')
                    ->limit(5)
                    ->get()
                    ->map(fn (Vendor $v) => [
                        'store_name' => $v->store_name,
                        'rating' => (float) $v->rating,
                        'products_count' => $v->products_count,
                        'status' => $v->status,
                    ]),
            ],
        ]);
    }
}
