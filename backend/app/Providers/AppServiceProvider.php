<?php

namespace App\Providers;

use App\Services\CurrencyService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // One resolved active currency per request, shared across resources.
        $this->app->scoped(CurrencyService::class);
    }

    public function boot(): void
    {
        // Protect against N+1 and silent attribute mistakes in non-production envs.
        Model::shouldBeStrict(! $this->app->isProduction());

        // Prevent lazy loading from masking performance issues during development.
        Model::preventLazyLoading(! $this->app->isProduction());
    }
}
