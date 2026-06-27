<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route guard for role-based access control.
 *
 * Usage:  Route::middleware('role:vendor')  or  'role:vendor,admin'
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => __('This action is unauthorized.'),
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
