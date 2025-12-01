<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('');
});

Route::get('/t', function () {
    return view('test');
});


Route::post('register',[UserController::class,'register']);


Route::post('/api/auth/google-login', [GoogleAuthController::class, 'loginWithGoogle']);


/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/