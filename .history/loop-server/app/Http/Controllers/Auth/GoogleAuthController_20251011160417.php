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
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid','profile','email'])
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            \Log::info('Google user data: ', (array)$googleUser);

            $user = User::updateOrCreate(
                [
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? 'User',
                    'is_verified' => 1,
                    'email_verified_at' => now(),
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            \Log::info('Created or updated user ID: ' . $user->id);

            Auth::login($user);

            return redirect('http://localhost:3000/email-verified?user=' . $user->id);

        } catch (\Exception $e) {
            \Log::error('Google login error: ' . $e->getMessage());
            dd($e->getMessage());
        }
    }
}
