<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminVendorResource;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VendorController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Vendor::query()
            ->with('user')
            ->withCount('products')
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->query('q')) {
            $query->where('store_name', 'like', "%{$q}%");
        }

        return AdminVendorResource::collection($query->paginate(20)->withQueryString());
    }

    /**
     * Approve / suspend / reset a vendor's marketplace status.
     */
    public function updateStatus(Request $request, Vendor $vendor): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,approved,suspended'],
        ]);

        $vendor->update(['status' => $data['status']]);

        return response()->json([
            'message' => __('Vendor status updated.'),
            'data' => (new AdminVendorResource($vendor->load('user')->loadCount('products')))->resolve(),
        ]);
    }
}
