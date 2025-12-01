<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        // Traditional callback - ignore for now
        return redirect('http://localhost:3000');
    }

    // 🔥 NEW METHOD FOR REACT POST
    public function handleGoogleToken(Request $request)
    {
        \Log::info('Google token received', ['token' => $request->token]);
        
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
            \Log::error('Google auth error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}