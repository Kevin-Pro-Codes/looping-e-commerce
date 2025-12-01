<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Step 1: Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Step 2: Handle Google callback
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Log raw Google data for debugging
            \Log::info('Google user raw data: ', (array)$googleUser);

            // Check that Google returned an email
            $email = $googleUser->getEmail();
            if (!$email) {
                throw new \Exception('Google account did not return an email.');
            }

            // Find existing user by email or create new
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? 'User',
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                    'password' => bcrypt(Str::random(16)), // random password for Google accounts
                ]
            );

            // Log the DB operation
            \Log::info('User created or updated with ID: ' . $user->id);

            // Login the user
            Auth::login($user);

            // Redirect to frontend with user ID
            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Google login error: ' . $e->getMessage());
            dd('Google login failed: ' . $e->getMessage());
        }
    }
}
