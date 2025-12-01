<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {return $request->user();});

Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);


