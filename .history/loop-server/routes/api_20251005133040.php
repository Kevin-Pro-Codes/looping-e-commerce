<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('http://localhost:8000/api/auth/google/callback', [GoogleAuthController::class, 'loginWithGoogle']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

Route::post('/api/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});


