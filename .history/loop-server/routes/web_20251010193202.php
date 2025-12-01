<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Inertia\Inertia;





{/*
Route::get('/', function () {return view('welcome.blade.php');});
*/}

Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});


Route::get('/login', [App\Http\Controllers\Auth\LoginController::class, 'login'])->name('login');

Route::middleware(['web', \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::get('/login', [LoginController::class, 'login']);
    Route::post('/login', [LoginController::class, 'login']);
     Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/register', [RegisterController::class, 'register']);   
    Route::get('/sanctum/csrf-cookie', [\Laravel\Sanctum\Http\Controllers\CsrfCookieController::class, 'show']);
});

Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return Inertia\Inertia::render('Dashboard');
})->name('dashboard');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});




Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill(); // marks email verified
    $user = $request->user();
    $user->is_verified = true;
    $user->save();

    // redirect to Inertia Dashboard instead of external Blade view
    return Inertia::render('Dashboard'); // or redirect()->route('dashboard')
})->middleware(['auth', 'signed'])->name('verification.verify');
