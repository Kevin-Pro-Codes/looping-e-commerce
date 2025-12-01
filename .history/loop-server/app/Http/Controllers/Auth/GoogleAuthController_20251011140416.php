<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Redirect to Google OAuth
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Handle callback from Google
    public function handleGoogleCallback()
    {
        try {
            // --- HERE ---
            $googleUser = Socialite::driver('google')->stateless()->user();
            \Log::info('Google user data: ', (array)$googleUser);
            // --- END HERE ---

            $email = $googleUser->getEmail();

            if (!$email) {
                \Log::error('Google OAuth did not return an email for this user.');
                return redirect('http://localhost:3000/login?error=no_email_from_google');
            }

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $googleUser->getName() ?? 'Google User',
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            Auth::login($user);

            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }
}
