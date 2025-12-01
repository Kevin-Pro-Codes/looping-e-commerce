<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);

Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'API is working!',
        'data' => $request->all(),
    ]);});