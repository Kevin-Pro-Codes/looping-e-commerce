<?php

use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('http://localhost:3000/api/auth/google/callback', [GoogleAuthController::class, 'loginWithGoogle']);
