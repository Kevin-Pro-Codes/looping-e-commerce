<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\DB;
use MongoDB\Client; 
use MongoDB\BSON\ObjectId;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// ✅ KEEP THIS - CSRF COOKIE (DELETE from web.php)
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// ✅ ADD THESE - Move login/register to api.php (no CSRF middleware here)
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/logout', [LoginController::class, 'logout']);

// ✅ Keep Google auth
Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);

// ✅ KEEP ALL YOUR EXISTING auth:sanctum routes (unchanged)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

Route::middleware('auth:sanctum')->put('/user/{id}', function (Request $request, $id) {
    if ($request->user()->id != $id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    $request->user()->update($request->only([
        'nome', 'email', 'telefone', 'cpf', 'data_nascimento', 'avatar', 'receber_marketing',
    ]));
    return response()->json($request->user());
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});

// ✅ KEEP ALL YOUR MongoDB routes (unchanged)
Route::get('/test-mongodb-connection', function () { /* ... */ });
Route::get('/test-mongo', function() { /* ... */ });
Route::get('/products', function () { /* ... */ });
Route::get('/products/{id}', function ($id) { /* ... */ });
Route::post('/products', function (Request $request) { /* ... */ });
Route::put('/products/{id}', function (Request $request, $id) { /* ... */ });
Route::delete('/products/{id}', function ($id) { /* ... */ });