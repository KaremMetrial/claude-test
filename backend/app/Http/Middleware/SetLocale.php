<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolve the active locale for every request.
 *
 * Resolution order (first match wins):
 *   1. ?lang= query parameter
 *   2. X-Locale request header
 *   3. Accept-Language header (best match against supported locales)
 *   4. Configured application default
 *
 * Only locales listed in config('app.supported_locales') are honoured, so a
 * malicious or unsupported value can never break translation lookups.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = (array) config('app.supported_locales', ['en']);
        $fallback = (string) config('app.fallback_locale', 'en');

        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $this->fromAcceptLanguage($request, $supported);

        if (! in_array($locale, $supported, true)) {
            $locale = $fallback;
        }

        app()->setLocale($locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    /**
     * Pick the best supported locale from the Accept-Language header.
     */
    private function fromAcceptLanguage(Request $request, array $supported): ?string
    {
        $header = $request->header('Accept-Language');

        if (! $header) {
            return null;
        }

        foreach (explode(',', $header) as $part) {
            $code = strtolower(trim(explode(';', $part)[0]));
            $primary = substr($code, 0, 2);

            if (in_array($primary, $supported, true)) {
                return $primary;
            }
        }

        return null;
    }
}
