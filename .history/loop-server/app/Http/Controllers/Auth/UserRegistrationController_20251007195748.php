<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\Usuario;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6|confirmed'
        ]);

        $user = Usuario::create([
            'nome' => $request->nome,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        // Generate email verification token
        $token = Str::uuid();
        \DB::table('email_verifications')->insert([
            'usuario_id' => $user->id,
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        $verificationLink = url("/verify-email?token=$token");

        Mail::raw("Click to verify your email: $verificationLink", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Email Verification');
        });

        return response()->json(['message' => 'Registration successful. Check your email to verify your account.']);
    }
}
