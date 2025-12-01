<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google OAuth page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle the Google OAuth callback.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find existing user by email or create a new one
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName() ?? 'Google User',
                    'is_verified' => 1, // mark email as verified
                    'email_verified_at' => now(),
                    'password' => bcrypt(str()->random(16)), // random password for OAuth users
                ]
            );

            // Log in the user
            Auth::login($user);

            // Redirect to React SPA
            return redirect('http://localhost:3000/dashboard?user=' . $user->id);

        } catch (\Exception $e) {
            // Log error if needed
            \Log::error('Google login error: ' . $e->getMessage());

            // Redirect to frontend with error
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }
}
