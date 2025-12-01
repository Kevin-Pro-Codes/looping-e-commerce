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

// For redirect flow
public function handleGoogleRedirectCallback() {
    $googleUser = Socialite::driver('google')->stateless()->user();
    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'google_id' => $googleUser->getId(),
            'name' => $googleUser->getName(),
            'is_verified' => 1,
            'email_verified_at' => now(),
            'password' => bcrypt(Str::random(16)),
        ]
    );
    Auth::login($user);
    return redirect('http://localhost:3000/email-verified?user='.$user->id);
}

// For SPA token flow
public function handleGoogleTokenCallback(Request $request) {
    $token = $request->bearerToken();
    $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);
    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'google_id' => $googleUser->getId(),
            'name' => $googleUser->getName(),
            'is_verified' => 1,
            'email_verified_at' => now(),
            'password' => bcrypt(Str::random(16)),
        ]
    );
    Auth::login($user);
    return response()->json(['success'=>true,'user'=>$user]);
}

}
