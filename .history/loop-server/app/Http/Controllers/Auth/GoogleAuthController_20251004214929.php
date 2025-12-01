<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Http\Request;

class GoogleController extends Controller
{
    // Redireciona usuário para login Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Callback do Google
    public function handleGoogleCallback(Request $request)
    {
        // Recebe token do Google (via SPA, front-end envia credential JWT)
        $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->token);

        // Cria ou encontra usuário no banco
        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            ['name' => $googleUser->getName()]
        );

        // Gera token Laravel Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
