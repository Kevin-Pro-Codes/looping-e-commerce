<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\LoginController;





Route::get('/', function () {return view('welcome.blade.php');});

Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});



Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [LoginController::class, 'me'])->middleware('auth:sanctum');



Route::post('/register', [RegisterController::class, 'register']);
Route::get('/dashboard', [RegisterController::class, 'index'])
     ->middleware(['auth', 'verified']);




