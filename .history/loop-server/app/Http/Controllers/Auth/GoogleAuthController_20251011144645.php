<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            \Log::info('Google user data: ', (array)$googleUser);

            // Check if user already exists
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?? 'User',
                    'email' => $googleUser->getEmail(),
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                    'password' => bcrypt(str()->random(16)),
                ]);
                \Log::info('Created user ID: ' . $user->id);
            } else {
                \Log::info('User already exists ID: ' . $user->id);
            }

            // Simple session login (remove token stuff)
            Auth::login($user);

            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=auth_failed');
        }
    }
}