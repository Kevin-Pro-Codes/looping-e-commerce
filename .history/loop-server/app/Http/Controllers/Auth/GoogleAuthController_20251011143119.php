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
        $googleUser = Socialite::driver('google')->stateless()->user();
        \Log::info('Google user data: ', (array)$googleUser);

       $user = User::findOrFail($id);

     
        \Log::info('Verification attempt', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_verified_email' => $user->hasVerifiedEmail(),
            'current_email_verified_at' => $user->email_verified_at,
            'current_is_verified' => $user->is_verified
        ]);

        \Log::info('Created user ID: ' . $user->id);

        Auth::login($user);

        return redirect('http://localhost:3000/email-verified?user=' . $user->id);

    } catch (\Exception $e) {
        \Log::error('Google login error: ' . $e->getMessage());
        dd($e->getMessage());
    }
}

}
