<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);