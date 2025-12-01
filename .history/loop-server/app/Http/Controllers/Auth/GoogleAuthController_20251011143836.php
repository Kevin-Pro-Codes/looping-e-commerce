<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Verified;
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
            \Log::info('Google user data: ', (array)$googleUser);

            $email = $googleUser->getEmail();
            $name  = $googleUser->getName() ?? 'Google User';

            if (!$email) {
                \Log::error('Google OAuth did not return an email.');
                return redirect('http://localhost:3000/login?error=no_email_from_google');
            }

            // Create user if it doesn't exist
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt(str()->random(16)),
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                ]
            );

            // Mark as verified if not yet
            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified(); // sets email_verified_at
                $user->is_verified = 1;
                $user->save();
                event(new Verified($user));
            }

            // Log in user
            Auth::login($user);

            // Redirect to React SPA
            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }
}
