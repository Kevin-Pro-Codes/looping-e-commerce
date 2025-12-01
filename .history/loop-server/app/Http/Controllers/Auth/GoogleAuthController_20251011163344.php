<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function handleGoogleCallback(\Illuminate\Http\Request $request)
    {
        try {
            $token = $request->bearerToken(); 

            if (!$token) {
                return response()->json(['error' => 'No token provided'], 400);
            }

            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            $email = $googleUser->getEmail();
            if (!$email) {
                return response()->json(['error' => 'No email returned by Google'], 400);
            }

            // Check if user exists with this email but without google_id
            $user = User::where('email', $email)->first();

            if ($user) {
                // Update existing user with google_id
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? 'User',
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)), // Random password for Google users
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                ]);
            }

            // Create Sanctum token for API authentication
            $token = $user->createToken('google-auth-token')->plainTextToken;

            Auth::login($user);

            return response()->json([
                'success' => true, 
                'user' => $user,
                'token' => $token
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            return response()->json(['error' => 'Authentication failed'], 500);
        }
    }
}