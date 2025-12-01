<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Auth;


{/*
Route::get('/', function () {return view('welcome.blade.php');});
*/}

Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});





