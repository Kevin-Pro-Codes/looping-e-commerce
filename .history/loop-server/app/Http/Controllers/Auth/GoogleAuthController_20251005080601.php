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

        if (!$googleToken) {
            return response()->json(['error' => 'No Google token provided'], 400);
        }

        // Call Google API with Authorization header (correct way)
        $googleUser = Http::withHeaders([
            'Authorization' => 'Bearer ' . $googleToken,
        ])->get('https://www.googleapis.com/oauth2/v3/userinfo')->json();

        if (!isset($googleUser['email'])) {
            return response()->json(['error' => 'Invalid Google token'], 401);
        }

        // Create or fetch user
        $user = User::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'name' => $googleUser['name'] ?? 'No Name',
                'password' => bcrypt(\Str::random(16)),
            ]
        );

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }
}
