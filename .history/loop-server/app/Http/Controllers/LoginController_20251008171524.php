<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LoginController extends Controller
{
 public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    if (!$user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Please verify your email'], 403);
    }

    $token = $user->createToken('login_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'login_token' => $token,
        'user' => $user,
    ]);
}

}
