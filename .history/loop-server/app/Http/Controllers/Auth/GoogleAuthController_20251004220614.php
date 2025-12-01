<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function handleCallback(Request $request)
    {
        try {
            $idToken = $request->input('token');
            
            // Verify the Google ID token
            $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken
            ]);
            
            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Invalid Google token'
                ], 401);
            }
            
            $googleUser = $response->json();
            
            // Validate the token audience
            $clientId = env('GOOGLE_CLIENT_ID');
            if ($googleUser['aud'] !== $clientId) {
                return response()->json([
                    'error' => 'Invalid token audience'
                ], 401);
            }
            
            // Find or create user
            $user = User::where('email', $googleUser['email'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'password' => Hash::make(Str::random(16)),
                    'google_id' => $googleUser['sub'],
                ]);
            }
            
            // Generate simple API token (without Sanctum/Passport)
            $apiToken = $this->generateApiToken($user);
            
            return response()->json([
                'access_token' => $apiToken,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Google auth error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Authentication failed'
            ], 500);
        }
    }
    
    private function generateApiToken(User $user)
    {
        // Create a simple token (you can use JWT or any other method)
        $token = hash('sha256', Str::random(60));
        
        // Store token in database (add api_token column to users table)
        $user->forceFill([
            'api_token' => $token,
        ])->save();
        
        return $token;
    }
}