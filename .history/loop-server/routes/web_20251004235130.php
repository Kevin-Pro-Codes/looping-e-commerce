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
