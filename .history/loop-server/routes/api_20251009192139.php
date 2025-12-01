<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;



Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->get('/user/{id}', function ($id) {
    return User::findOrFail($id);
});