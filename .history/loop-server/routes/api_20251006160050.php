<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;



Route::get('/test', function () {
    return response()->json(['message' => 'CORS test successful']);
});

Route::post('/auth/google-login', [SocialiteController::class, 'googleLogin']);


Route::post('/auth/google-login', [GoogleController::class, 'login']);