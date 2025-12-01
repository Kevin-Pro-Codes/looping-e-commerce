<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;




Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});


Route::post('/auth/google-login', [SocialiteController::class, 'googleLogin']);


Route::post('/auth/google-login', [GoogleController::class, 'login']);


