<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialiteController extends Controller
{
    public function googleLogin(Request $request)
    {
        $googleToken = $request->input('token');

        // Get user from Google
        $googleUser = Socialite::driver('google')->userFromToken($googleToken);

        // Find or create user
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            ['name' => $googleUser->getName()]
        );

        // Login the user
        Auth::login($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }
}
