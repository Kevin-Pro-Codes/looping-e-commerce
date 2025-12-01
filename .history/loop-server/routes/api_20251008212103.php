<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;


{/*
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});
*/} 



use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;

Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::post('/register', [RegisterController::class, 'register'])->name('register');

// Keep your /test and other non-auth routes as needed
Route::get('/test', function () {
    return response()->json(['message' => 'CORS test successful', 'status' => 'success']);
});

// Protected routes (e.g., for email verification) can stay or move here with auth:sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Your verification routes...
});