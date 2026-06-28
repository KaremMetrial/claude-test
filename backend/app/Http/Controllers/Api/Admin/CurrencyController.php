<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminCurrencyResource;
use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class CurrencyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return AdminCurrencyResource::collection(Currency::orderByDesc('is_default')->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request);
        $currency = Currency::create($data);
        $this->syncDefault($currency, $request->boolean('is_default'));

        return $this->respond($currency, __('Currency created.'), 201);
    }

    public function update(Request $request, Currency $currency): JsonResponse
    {
        $data = $this->validateData($request, $currency);
        $currency->update($data);
        $this->syncDefault($currency, $request->boolean('is_default'));

        return $this->respond($currency, __('Currency updated.'));
    }

    public function destroy(Currency $currency): JsonResponse
    {
        abort_if($currency->is_default, 422, __('You cannot delete the default currency.'));
        $currency->delete();
        Cache::forget('currencies.active');

        return response()->json(['message' => __('Currency deleted.')]);
    }

    private function validateData(Request $request, ?Currency $currency = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'size:3', Rule::unique('currencies', 'code')->ignore($currency?->id)],
            'name' => ['required', 'string', 'max:64'],
            'symbol' => ['required', 'string', 'max:8'],
            'symbol_position' => ['required', 'in:before,after'],
            'exchange_rate' => ['required', 'numeric', 'gt:0'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:4'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
        ]);
    }

    /**
     * Ensure exactly one default currency exists.
     */
    private function syncDefault(Currency $currency, bool $makeDefault): void
    {
        if ($makeDefault) {
            Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
            $currency->update(['is_default' => true]);
        }

        Cache::forget('currencies.active');
    }

    private function respond(Currency $currency, string $message, int $code = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => (new AdminCurrencyResource($currency->fresh()))->resolve(),
        ], $code);
    }
}
