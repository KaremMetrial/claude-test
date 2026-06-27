<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Turns a cart into orders.
 *
 * A single checkout can contain products from several vendors, so we create one
 * parent Order for the customer plus one child (sub) Order per vendor. Money is
 * captured in the customer's active currency, converting each line item from the
 * vendor's base currency.
 */
class CheckoutService
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    /**
     * @param  array<string, mixed>  $payload  shipping_address, billing_address, payment_method, coupon_code, notes
     */
    public function place(User $user, Cart $cart, array $payload): Order
    {
        $cart->loadMissing(['items.product.vendor']);

        if ($cart->items->isEmpty()) {
            throw new RuntimeException(__('Your cart is empty.'));
        }

        $active = $this->currency->active();

        return DB::transaction(function () use ($user, $cart, $payload, $active) {
            // Group cart items by their owning vendor.
            $byVendor = $cart->items->groupBy(fn ($item) => $item->product->vendor_id);

            $parent = Order::create([
                'number' => $this->generateNumber(),
                'user_id' => $user->id,
                'status' => Order::STATUS_PENDING,
                'payment_status' => 'unpaid',
                'payment_method' => $payload['payment_method'] ?? 'cod',
                'currency' => $active->code,
                'exchange_rate' => $active->exchange_rate,
                'shipping_address' => $payload['shipping_address'] ?? null,
                'billing_address' => $payload['billing_address'] ?? ($payload['shipping_address'] ?? null),
                'notes' => $payload['notes'] ?? null,
            ]);

            $grandSubtotal = 0.0;

            foreach ($byVendor as $vendorId => $items) {
                $subtotal = 0.0;

                $subOrder = Order::create([
                    'number' => $parent->number.'-'.$vendorId,
                    'user_id' => $user->id,
                    'parent_id' => $parent->id,
                    'vendor_id' => $vendorId,
                    'status' => Order::STATUS_PENDING,
                    'payment_status' => 'unpaid',
                    'payment_method' => $parent->payment_method,
                    'currency' => $active->code,
                    'exchange_rate' => $active->exchange_rate,
                    'shipping_address' => $parent->shipping_address,
                    'billing_address' => $parent->billing_address,
                ]);

                foreach ($items as $item) {
                    $product = $item->product;
                    $unit = $this->currency->convert((float) $item->unit_price, $product->currency);
                    $line = round($unit * $item->quantity, $active->decimal_places);
                    $subtotal += $line;

                    OrderItem::create([
                        'order_id' => $subOrder->id,
                        'product_id' => $product->id,
                        'vendor_id' => $vendorId,
                        'product_name' => $product->translate('name') ?? $product->slug,
                        'product_sku' => $product->sku,
                        'unit_price' => $unit,
                        'quantity' => $item->quantity,
                        'line_total' => $line,
                    ]);

                    // Decrement stock and bump sales counters.
                    $product->decrement('stock', $item->quantity);
                    $product->increment('total_sales', $item->quantity);
                }

                $subOrder->update([
                    'subtotal' => $subtotal,
                    'grand_total' => $subtotal,
                ]);

                $grandSubtotal += $subtotal;
            }

            // Apply an optional coupon at the parent (whole-order) level.
            $discount = $this->applyCoupon($payload['coupon_code'] ?? null, $grandSubtotal);

            $parent->update([
                'subtotal' => $grandSubtotal,
                'discount_total' => $discount,
                'coupon_code' => $discount > 0 ? strtoupper((string) $payload['coupon_code']) : null,
                'grand_total' => max(0, round($grandSubtotal - $discount, $active->decimal_places)),
            ]);

            // Empty the cart now that it's been converted into an order.
            $cart->items()->delete();

            return $parent->load(['items', 'subOrders.items']);
        });
    }

    private function applyCoupon(?string $code, float $subtotal): float
    {
        if (! $code) {
            return 0.0;
        }

        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon || ! $coupon->isValidFor($subtotal)) {
            return 0.0;
        }

        $coupon->increment('used_count');

        return $coupon->discountFor($subtotal);
    }

    private function generateNumber(): string
    {
        return 'BZR-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
    }
}
