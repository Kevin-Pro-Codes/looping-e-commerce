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
     $data = json_decode($request->getContent(), true);
if (!is_array($data)) {
    $data = [];
}
\Log::info('Incoming Google request:', $data);

        $googleToken = $data['token'] ?? null;
        $name = $data['name'] ?? 'No Name';

        if (!$googleToken) {
            return response()->json(['error' => 'No Google token provided'], 400);
        }

        // Validate token with Google
        $googleUser = Http::get("https://www.googleapis.com/oauth2/v3/userinfo", [
            'access_token' => $googleToken,
        ])->json();

        if (!isset($googleUser['email'])) {
            return response()->json(['error' => 'Invalid Google token'], 401);
        }

        // Create or fetch user
        $user = User::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'name' => $googleUser['name'] ?? $name,
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }
}
