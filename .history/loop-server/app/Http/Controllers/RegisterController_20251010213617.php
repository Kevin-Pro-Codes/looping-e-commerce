<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        // Validate input
      $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users',
    'password' => 'required|string|min:8', 
    //'password' => 'required|string|min:8|confirmed',
]);

protected function redirectTo()
{
    return 'http://localhost:3000/perfil';
}

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_verified' => false, 
        ]);

        // Fire Registered event to send verification email
        event(new Registered($user));

        return response()->json([
            'message' => 'Registration successful. Check your email for verification link.',
            'user' => $user
        ]);
    }
}
