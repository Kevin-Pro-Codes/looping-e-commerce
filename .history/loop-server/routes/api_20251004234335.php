<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
