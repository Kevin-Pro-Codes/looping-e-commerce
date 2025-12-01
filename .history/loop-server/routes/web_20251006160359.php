<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SocialiteController;

Route::get('/', function () {return view('welcome.blade.php');});


Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    });
});



/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/



Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept')
        ->header('Access-Control-Allow-Credentials', 'true');
})->where('any', '.*');