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




Route::post('/auth/google/register', [GoogleAuthController::class, 'register']);
