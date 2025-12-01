<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid','profile','email'])
            ->redirect();
    }

   public function handleGoogleCallback(\Illuminate\Http\Request $request)
{
    try {
        $token = $request->bearerToken(); 

        if (!$token) {
            return response()->json(['error' => 'No token provided'], 400);
        }

        $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

        $email = $googleUser->getEmail();
        if (!$email) return response()->json(['error' => 'No email returned by Google'], 400);

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName() ?? 'User',
                'is_verified' => 1,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(16)),
            ]
        );

        Auth::login($user);

        return response()->json(['success' => true, 'user' => $user], 200);

    } catch (\Exception $e) {
        \Log::error('Google login error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
