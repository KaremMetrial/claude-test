<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Resolve the current cart for an authenticated user or a guest token.
     *
     * Guests pass an opaque token via the X-Cart-Token header; the same token
     * is returned so the client can persist it and later merge on login.
     */
    private function resolveCart(Request $request): Cart
    {
        // These routes are public so guests can build a cart, but they may still
        // carry a Sanctum bearer token. Resolve it explicitly via the sanctum
        // guard — the default guard would ignore the token and treat every call
        // as a new guest, fragmenting the cart.
        if ($user = $request->user('sanctum')) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $token = $request->header('X-Cart-Token') ?: (string) \Illuminate\Support\Str::uuid();

        return Cart::firstOrCreate(['session_token' => $token]);
    }

    private function respond(Cart $cart): JsonResponse
    {
        $cart->load(['items.product.translations']);

        return response()->json([
            'data' => (new CartResource($cart))->resolve(),
            'cart_token' => $cart->session_token,
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        return $this->respond($this->resolveCart($request));
    }

    public function addItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::active()->findOrFail($data['product_id']);
        $cart = $this->resolveCart($request);
        $quantity = $data['quantity'] ?? 1;

        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = ($item->exists ? $item->quantity : 0) + $quantity;
        $item->unit_price = $product->price;
        $item->save();

        return $this->respond($cart);
    }

    public function updateItem(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request);

        abort_unless($item->cart_id === $cart->id, 403);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        if ($data['quantity'] === 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $data['quantity']]);
        }

        return $this->respond($cart);
    }

    public function removeItem(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request);

        abort_unless($item->cart_id === $cart->id, 403);

        $item->delete();

        return $this->respond($cart);
    }
}
