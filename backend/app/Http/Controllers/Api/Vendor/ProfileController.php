<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Resources\VendorResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends VendorBaseController
{
    public function show(Request $request): JsonResponse
    {
        $vendor = $this->vendor($request);

        return response()->json([
            'data' => [
                'store_name' => $vendor->store_name,
                'slug' => $vendor->slug,
                'description' => $vendor->description,
                'logo' => $vendor->logo,
                'banner' => $vendor->banner,
                'email' => $vendor->email,
                'phone' => $vendor->phone,
                'address' => $vendor->address,
                'city' => $vendor->city,
                'country' => $vendor->country,
                'base_currency' => $vendor->base_currency,
                'commission_rate' => (float) $vendor->commission_rate,
                'status' => $vendor->status,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $vendor = $this->vendor($request);

        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'url', 'max:2048'],
            'banner' => ['nullable', 'url', 'max:2048'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'base_currency' => ['required', 'string', 'size:3'],
        ]);

        $vendor->update($data);

        return response()->json([
            'message' => __('Store profile updated.'),
            'data' => (new VendorResource($vendor))->resolve(),
        ]);
    }
}
