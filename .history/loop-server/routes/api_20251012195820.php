<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\AddressController;


{/*
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});
*/} 



Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});





Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json([
        'id' => $request->user()->id,
        'nome' => $request->user()->nome,
        'email' => $request->user()->email,
        'telefone' => $request->user()->telefone,
        'cpf' => $request->user()->cpf,
        'data_nascimento' => $request->user()->data_nascimento,
        'avatar' => $request->user()->avatar,
        'receber_marketing' => $request->user()->receber_marketing,
        'addresses' => $request->user()->addresses ?? [],
        'payment' => $request->user()->payment ?? [],
    ]);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});