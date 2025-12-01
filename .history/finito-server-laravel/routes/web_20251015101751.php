<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Inertia\Inertia;

// ✅ KEEP Google redirect (browser-based)
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

// ✅ KEEP redirect to React
Route::get('/login', fn() => redirect('http://localhost:3000/login'))->name('login');

// ✅ REMOVE these entire blocks:
// - The middleware(['web', EnsureFrontendRequestsAreStateful::class]) group
// - Route::get('/sanctum/csrf-cookie'...) 
// - All login/register/logout routes (moved to api.php)

// ✅ KEEP email verification (unchanged)
Route::get('/email/verify', function () {
    return view('auth.verify-email'); 
})->middleware('auth')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->middleware(['signed']) 
    ->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');