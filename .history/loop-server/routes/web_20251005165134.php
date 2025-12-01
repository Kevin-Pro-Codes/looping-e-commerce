<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', function () {return view('');});

Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'API is working!',
        'data' => $request->all(),
    ]);});

Route::get('/dashboard', [DashboardController::class, 'index']);


/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/