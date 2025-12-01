<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\RegisterController;




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



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'getProfile']);
    Route::put('/user', [UserController::class, 'updateProfile']);
   
    Route::get('/user/{id}', [UserController::class, 'show']);
    Route::put('/user/{id}', [UserController::class, 'update']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    Route::get('/payment-methods', [PaymentController::class, 'index']);
    Route::post('/payment-methods', [PaymentController::class, 'store']);
    Route::put('/payment-methods/{id}', [PaymentController::class, 'update']);
    Route::delete('/payment-methods/{id}', [PaymentController::class, 'destroy']);

  
});



Route::middleware('web')->post('/register', [RegisterController::class, 'register']);