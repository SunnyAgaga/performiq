<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Force HTTPS for all generated URLs when behind the Replit proxy
        URL::forceScheme('https');

        Gate::define('admin', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manager-or-admin', function (User $user) {
            return $user->isAdmin() || $user->isManager();
        });
    }
}
