<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'description' => 'Bazario multivendor multilingual e-commerce API',
        'docs' => url('/api/v1'),
        'health' => url('/up'),
    ]);
});
