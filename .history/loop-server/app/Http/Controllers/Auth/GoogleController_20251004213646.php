<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class GoogleAuthController extends Controller
{
    public function register(Request $request)
    {
        // $request->input('token') or $request->all() depending on what React sends
        $googleUser = $request->all();

        // Example: Find or create the user
        $user = User::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'name' => $googleUser['name'],
                'password' => bcrypt(str()->random(16)),
            ]
        );

        // Login the user and return a token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user
        ]);
    }
}
