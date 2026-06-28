<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LocalizationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\Vendor\DashboardController as VendorDashboard;
use App\Http\Controllers\Api\Vendor\OrderController as VendorOrders;
use App\Http\Controllers\Api\Vendor\ProductController as VendorProducts;
use App\Http\Controllers\Api\Vendor\ProfileController as VendorProfile;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
| All routes are prefixed with /api (see bootstrap/app.php) and pass through
| the SetLocale middleware, so every response honours ?lang / X-Locale and
| ?currency / X-Currency.
*/

Route::prefix('v1')->group(function () {

    // --- Public storefront -------------------------------------------------
    Route::get('localization', LocalizationController::class);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{slug}', [CategoryController::class, 'show']);

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    Route::get('vendors', [VendorController::class, 'index']);
    Route::get('vendors/{slug}', [VendorController::class, 'show']);
    Route::get('vendors/{slug}/products', [VendorController::class, 'products']);

    // --- Cart (works for guests via X-Cart-Token, or authenticated users) --
    Route::get('cart', [CartController::class, 'show']);
    Route::post('cart/items', [CartController::class, 'addItem']);
    Route::patch('cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('cart/items/{item}', [CartController::class, 'removeItem']);

    // --- Auth --------------------------------------------------------------
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // --- Authenticated -----------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{number}', [OrderController::class, 'show']);
        Route::post('checkout', [OrderController::class, 'store']);

        Route::post('products/{slug}/reviews', [ReviewController::class, 'store']);
    });

    // --- Vendor dashboard (auth + vendor role) -----------------------------
    Route::middleware(['auth:sanctum', 'role:vendor,admin'])
        ->prefix('vendor')
        ->group(function () {
            Route::get('dashboard/stats', [VendorDashboard::class, 'stats']);

            Route::get('products', [VendorProducts::class, 'index']);
            Route::post('products', [VendorProducts::class, 'store']);
            Route::get('products/{product}', [VendorProducts::class, 'show']);
            Route::put('products/{product}', [VendorProducts::class, 'update']);
            Route::delete('products/{product}', [VendorProducts::class, 'destroy']);

            Route::get('orders', [VendorOrders::class, 'index']);
            Route::get('orders/{order}', [VendorOrders::class, 'show']);
            Route::patch('orders/{order}/status', [VendorOrders::class, 'updateStatus']);

            Route::get('profile', [VendorProfile::class, 'show']);
            Route::put('profile', [VendorProfile::class, 'update']);
        });
});
