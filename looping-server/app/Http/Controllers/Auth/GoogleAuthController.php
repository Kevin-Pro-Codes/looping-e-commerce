<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Handle Google OAuth login for SPA
     * Expects POST request with JSON: { "token": "<google_id_token>" }
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            Log::info('Google auth started', ['request_data' => $request->all()]);

            $token = $request->input('token');

            if (!$token) {
                Log::error('No token provided in request');
                return response()->json(['error' => 'No token provided'], 400);
            }

            Log::info('Token received', ['token_length' => strlen($token)]);

            // Get user from Google using token
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            Log::info('Google user data', [
                'email' => $googleUser->getEmail(),
                'id' => $googleUser->getId(),
                'name' => $googleUser->getName()
            ]);

            $email = $googleUser->getEmail();

            if (!$email) {
                Log::error('No email from Google');
                return response()->json(['error' => 'No email returned by Google'], 400);
            }

            // Check if user exists
            $user = User::where('email', $email)->first();

            if ($user) {
                Log::info('User found, updating Google ID', ['user_id' => $user->id]);
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                ]);
            } else {
                Log::info('Creating new user');
                $user = User::create([
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? 'User',
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)), // random password
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                ]);
            }

            Log::info('User processed', ['user_id' => $user->id]);

            // Create Sanctum token for SPA authentication
            $authToken = $user->createToken('google-auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $authToken
            ], 200);

        } catch (\Exception $e) {
            Log::error('Google login error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Authentication failed: ' . $e->getMessage()], 500);
        }
    }
}
