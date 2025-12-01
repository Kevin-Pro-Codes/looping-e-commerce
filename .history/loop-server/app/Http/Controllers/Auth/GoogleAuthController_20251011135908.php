<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Step 1: Redirect to Google OAuth
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Step 2: Handle Google callback
    public function handleGoogleCallback()
    {
        try {
            // Get user info from Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Step 3: Create or get existing user in your database
            $user = User::create(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName() ?? 'Google User',
                    'email_verified_at' => now(),
                    'is_verified' => 1, // mark email as verified
                    'password' => bcrypt(str()->random(16)), // random password
                ]
            );

            // Step 4: Log in the user
            Auth::login($user);

            // Step 5: Redirect to React frontend
            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login failed: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }
}
