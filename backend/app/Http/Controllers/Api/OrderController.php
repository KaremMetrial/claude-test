<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()
            ->whereNull('parent_id')           // top-level orders only
            ->with(['items', 'subOrders.items'])
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $number): OrderResource
    {
        $order = $request->user()->orders()
            ->whereNull('parent_id')
            ->with(['items', 'subOrders.items'])
            ->where('number', $number)
            ->firstOrFail();

        return new OrderResource($order);
    }

    public function store(Request $request, CheckoutService $checkout): JsonResponse
    {
        $data = $request->validate([
            'payment_method' => ['nullable', 'string', 'in:cod,card,paypal,wallet'],
            'coupon_code' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.name' => ['required', 'string', 'max:255'],
            'shipping_address.phone' => ['required', 'string', 'max:40'],
            'shipping_address.line1' => ['required', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.country' => ['required', 'string', 'max:120'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:40'],
            'billing_address' => ['nullable', 'array'],
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->with('items.product.vendor')->first();

        if (! $cart) {
            return response()->json(['message' => __('Your cart is empty.')], 422);
        }

        try {
            $order = $checkout->place($request->user(), $cart, $data);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => __('Order placed successfully.'),
            'data' => (new OrderResource($order))->resolve(),
        ], 201);
    }
}
