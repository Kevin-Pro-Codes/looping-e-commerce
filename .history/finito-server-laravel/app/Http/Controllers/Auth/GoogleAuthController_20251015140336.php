<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        return redirect('http://localhost:3000');
    }

    // 🔥 THIS METHOD WAS MISSING! ADD IT:
    public function handleGoogleToken(Request $request)
    {
        $token = $request->input('token');
        
        if (!$token) {
            return response()->json(['error' => 'No token'], 400);
        }

        try {
            $googleUser = Socialite::driver('google')->userFromToken($token);
            
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'password' => Hash::make('google-password'),
                ]
            );

            $tokenResult = $user->createToken('auth-token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'token' => $tokenResult,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}