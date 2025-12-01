<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;




Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});

Route::post('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});


Route::post('/auth/google-login', [SocialiteController::class, 'googleLogin']);
Route::post('/auth/google-login', [GoogleController::class, 'login']);

Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [LoginController::class, 'me'])->middleware('auth:sanctum');




Route::middleware('auth:sanctum')->get('/me', [LoginController::class, 'me']);
Route::middleware('auth:sanctum')->post('/logout', [LoginController::class, 'logout']);






