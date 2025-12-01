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
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\VerifyEmail;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ProductController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful; 
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AddressController;

{/*
Route::get('/', function () {return view('welcome.blade.php');});


Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});
*/}



//Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);

//Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);

//Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

//Route::get('/login', fn() => redirect('http://localhost:3000/login'))->name('login');




Route::middleware(['web'])->group(function () {
    // ✅ GOOGLE AUTH (CSRF BYPASSED)
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);     
    Route::get('/login', fn() => redirect('http://localhost:3000/login'));
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/register', [RegisterController::class, 'register']);
    
    // ✅ GET PROFILE (web + sanctum = CSRF OK)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::get('/addresses', [AddressController::class, 'index']);
    });
});

// 🔥 PUT/POST/DELETE = SANCTUM ONLY (NO web = NO 401!)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);  
    //Route::get('/addresses', [AddressController::class, 'index']);         
    Route::post('/addresses', [AddressController::class, 'store']);         
    Route::put('/addresses/{address}', [AddressController::class, 'update']); 
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});



Route::get('/email/verify', function () {
    return view('auth.verify-email'); 
})->middleware('auth')->name('verification.notice');



Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware('signed') // keeps the signed URL secure
    ->name('verification.verify');

    
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');




