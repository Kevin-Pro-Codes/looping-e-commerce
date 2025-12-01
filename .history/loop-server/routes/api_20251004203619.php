<?php

/*
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::post('register',[UserController::class,'register']);
*/

use App\Http\Controllers\Auth\GoogleController;

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::post('/auth/google/callback', [App\Http\Controllers\Auth\GoogleController::class, 'handleGoogleCallback']);
