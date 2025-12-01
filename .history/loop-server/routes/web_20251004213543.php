<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\GoogleController;

Route::get('/', function () {
    return view('');
});

Route::get('/t', function () {
    return view('test');
});







Route::post('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

