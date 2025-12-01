<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SocialiteController;

Route::get('/', function () {return view('welcome.blade.php');});


Route::get('/dashboard', [DashboardController::class, 'index']);



/*
Route::get('/auth/google', [GoogleAuthController::class, 'handleCallback']);

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleCallback']);
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');


Route::controller(SocialiteController::class)->group(function() { 
    Route::get('auth/google', 'googleLogin')->name('auth.google'); 
    Route::get('auth/google-callback', 'googleAuthentication')->name('auth.google-callback'); 
});
