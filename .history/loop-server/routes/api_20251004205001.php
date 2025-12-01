<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui vão suas rotas de API. Rotas aqui já recebem prefixo /api
|
*/

// Rota para receber o token do Google enviado pelo React
Route::post('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
