<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends VendorBaseController
{
    /**
     * Headline metrics for the vendor overview screen.
     */
    public function stats(Request $request): JsonResponse
    {
        $vendor = $this->vendor($request);

        $orders = Order::where('vendor_id', $vendor->id)->whereNotNull('parent_id');

        $revenue = (clone $orders)
            ->whereIn('payment_status', ['paid'])
            ->sum('grand_total');

        return response()->json([
            'data' => [
                'products_total' => $vendor->products()->count(),
                'products_active' => $vendor->products()->where('is_active', true)->count(),
                'out_of_stock' => $vendor->products()->where('stock', 0)->count(),
                'orders_total' => (clone $orders)->count(),
                'orders_pending' => (clone $orders)->where('status', Order::STATUS_PENDING)->count(),
                'units_sold' => (int) OrderItem::where('vendor_id', $vendor->id)->sum('quantity'),
                'revenue_paid' => round((float) $revenue, 2),
                'rating' => (float) $vendor->rating,
                'store' => [
                    'name' => $vendor->store_name,
                    'slug' => $vendor->slug,
                    'status' => $vendor->status,
                    'base_currency' => $vendor->base_currency,
                ],
            ],
        ]);
    }
}
