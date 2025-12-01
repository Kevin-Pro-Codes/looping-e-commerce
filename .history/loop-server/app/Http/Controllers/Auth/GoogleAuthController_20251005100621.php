<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Only needed if you want server-side redirect login
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Only needed if you want server-side redirect callback
    public function handleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = \App\Models\User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            auth()->login($user);

            return response()->json(['user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed', 'message' => $e->getMessage()], 500);
        }
    }

    // ✅ New method for React SPA token login
    public function loginWithGoogle(Request $request)
    {
        $token = $request->input('token'); // token sent from React

        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            $user = \App\Models\User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            auth()->login($user);

            return response()->json(['user' => $user]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
