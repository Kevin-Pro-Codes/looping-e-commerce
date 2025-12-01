<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', function () {return view('');});

Route::get('/register', function () {return view('X');});

Route::get('/dashboard', [DashboardController::class, 'index']);


/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/