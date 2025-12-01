<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class GoogleAuthController extends Controller
{
    public function handleCallback(Request $request)
    {
        $googleToken = $request->input('token');

        $googleUser = Http::get("https://www.googleapis.com/oauth2/v3/userinfo", [
            'access_token' => $googleToken,
        ])->json();

        if (!isset($googleUser['email'])) {
            return response()->json(['error' => 'Invalid Google token'], 401);
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'name' => $googleUser['name'] ?? $googleUser['email'],
                'password' => bcrypt(str()->random(16)),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }
}
