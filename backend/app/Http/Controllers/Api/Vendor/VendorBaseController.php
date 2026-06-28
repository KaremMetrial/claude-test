<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;

abstract class VendorBaseController extends Controller
{
    /**
     * Resolve the store owned by the authenticated user.
     *
     * Uses an explicit query (not the dynamic relation accessor) so it works
     * even with lazy-loading prevention enabled in development.
     */
    protected function vendor(Request $request): Vendor
    {
        $vendor = $request->user()->vendor()->first();

        abort_if($vendor === null, 403, __('No vendor profile is linked to this account.'));

        return $vendor;
    }
}
