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


Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});


/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/