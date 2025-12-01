<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;



Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'API is working!',
        'data' => $request->all(),
    ]);});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/auth/google-login', [GoogleAuthController::class, 'login']);