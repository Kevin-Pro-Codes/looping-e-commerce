<?php

use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);
