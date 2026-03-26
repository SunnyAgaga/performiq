<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AppraisalCycleController;
use App\Http\Controllers\CriteriaController;
use App\Http\Controllers\AppraisalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GoalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Appraisals
    Route::resource('appraisals', AppraisalController::class);

    // Goals (nested under appraisals)
    Route::post('/appraisals/{appraisal}/goals', [GoalController::class, 'store'])->name('goals.store');
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy'])->name('goals.destroy');

    // Admin-only routes
    Route::middleware('can:admin')->group(function () {
        Route::resource('cycles', AppraisalCycleController::class);
        Route::resource('criteria', CriteriaController::class);
        Route::resource('users', UserController::class);
    });
});

require __DIR__.'/auth.php';
