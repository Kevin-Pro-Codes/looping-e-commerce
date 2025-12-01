<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Test Route
|--------------------------------------------------------------------------
*/
Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
| These routes handle login, logout, and registration for your SPA.
| The route names are required for Laravel's auth middleware.
*/
Route::middleware('web')->group(function () {

    // Login
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::post('/login', [LoginController::class, 'login']);

    // Logout
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // Register
    Route::post('/register', [RegisterController::class, 'register']);

    // Sanctum CSRF
    Route::get('/sanctum/csrf-cookie', [\Laravel\Sanctum\Http\Controllers\CsrfCookieController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
| This route handles the email verification link from the email.
| Returns JSON so your SPA can handle the redirect.
*/
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {

    // Mark email as verified
    $request->fulfill();
    $user = $request->user();
    $user->is_verified = true;
    $user->save();

    // Return JSON instead of redirect
    return response()->json([
        'verified' => true,
        'message' => 'Email verified successfully'
    ]);

})->middleware(['signed']); // <-- remove 'auth'

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
| These routes require authentication and email verification.
| Use Inertia to render React pages.
*/
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/perfil', function () {
        return Inertia::render('Perfil');
    })->name('perfil');
});

/*
|--------------------------------------------------------------------------
| Catch-All Route for Inertia SPA
|--------------------------------------------------------------------------
| This should be last. Serves the main app for any frontend route.
*/
Route::get('/{any}', function () {
    return Inertia::render('App'); // Make sure you have App.jsx in Pages
})->where('any', '.*');
