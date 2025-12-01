<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;



<?php



class GoogleController extends Controller
{
    public function login(Request $request)
    {
        $token = $request->input('token');

        if (!$token) {
            return response()->json(['error' => 'Token missing'], 400);
        }

        try {
            // Get user info from Google
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            // Check if user exists or create
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                ['name' => $googleUser->getName()]
            );

            // Log in user
            Auth::login($user);

            return response()->json([
                'message' => 'Logged in successfully',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 400);
        }
    }
}
