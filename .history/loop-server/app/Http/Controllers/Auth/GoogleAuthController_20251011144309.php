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
            \Log::info('Google callback reached');
            
            $googleUser = Socialite::driver('google')->stateless()->user();
            \Log::info('Google user data received', [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
                'id' => $googleUser->getId()
            ]);

            // Check if user already exists
            $existingUser = User::where('email', $googleUser->getEmail())->first();
            if ($existingUser) {
                \Log::info('User already exists', ['user_id' => $existingUser->id]);
                Auth::login($existingUser);
                return redirect('http://localhost:3000/email-verified?user=' . $existingUser->id);
            }

            \Log::info('Attempting to create new user');
            
            $user = User::create([
                'name' => $googleUser->getName() ?? 'User',
                'email' => $googleUser->getEmail(),
                'is_verified' => 1,
                'email_verified_at' => now(),
                'password' => bcrypt(str()->random(16)),
            ]);

            \Log::info('User created successfully', ['user_id' => $user->id]);

            Auth::login($user);

            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect('http://localhost:3000/login?error=auth_failed');
        }
    }
}