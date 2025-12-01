<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/google-auth', [AuthController::class, 'handleGoogleAuth'])
    ->withoutMiddleware(['web']); 

Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'API is working!',
        'data' => $request->all(),
    ]);});

