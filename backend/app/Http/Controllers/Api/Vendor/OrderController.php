<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Resources\Vendor\VendorOrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends VendorBaseController
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $vendor = $this->vendor($request);

        $query = Order::where('vendor_id', $vendor->id)
            ->whereNotNull('parent_id')         // vendor sub-orders only
            ->with(['items', 'user'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return VendorOrderResource::collection($query->paginate(15)->withQueryString());
    }

    public function show(Request $request, Order $order): VendorOrderResource
    {
        $this->authorizeOrder($request, $order);

        return new VendorOrderResource($order->load(['items', 'user']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOrder($request, $order);

        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,completed,cancelled'],
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json([
            'message' => __('Order status updated.'),
            'data' => (new VendorOrderResource($order->load(['items', 'user'])))->resolve(),
        ]);
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        $vendor = $this->vendor($request);
        abort_if($order->vendor_id !== $vendor->id, 403, __('This order belongs to another store.'));
    }
}
