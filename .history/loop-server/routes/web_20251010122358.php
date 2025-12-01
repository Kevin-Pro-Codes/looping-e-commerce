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






{/*
Route::get('/', function () {return view('welcome.blade.php');});
*/}

Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});



Route::middleware('web')->group(function () {

Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent(); 
});

    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);      
    Route::post('/register', [RegisterController::class, 'register']);
    
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});


Route::get('/email/verify', function () {
    return view('auth.verify-email'); // you can use an Inertia page if needed
})->middleware('auth')->name('verification.notice');

// Handle email verification link
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('/dashboard'); // or wherever you want after verification
})->middleware(['auth', 'signed'])->name('verification.verify');

// Resend verification email
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');


