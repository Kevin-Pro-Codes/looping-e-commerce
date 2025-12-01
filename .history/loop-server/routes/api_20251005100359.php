<?php

use App\Http\Controllers\Auth\GoogleAuthController;

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);