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


Route::get('/login', function () {
    // Always send to your React app login page
    return redirect()->away('http://localhost:3000/login');
})->name('login');

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



Route::get('/email/verify', function () {
    return view('auth.verify-email'); // optional
})->middleware('auth')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    $user = $request->user();
    $user->is_verified = true;
    $user->save();

    return redirect('http://localhost:3000/perfil?verified=1');
})->middleware(['auth', 'signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
