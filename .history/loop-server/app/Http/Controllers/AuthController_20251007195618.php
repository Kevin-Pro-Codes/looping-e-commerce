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
    // 1️⃣ Register user and send verification email
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

        // Generate token
        $token = Str::uuid();
        \DB::table('email_verifications')->insert([
            'usuario_id' => $user->id,
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        $verificationLink = url("/verify-email?token=$token");

        // Send email
        Mail::raw("Click this link to verify your email: $verificationLink", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Email Verification');
        });

        return response()->json(['message' => 'Registration successful. Check your email to verify your account.']);
    }

    // 2️⃣ Verify email
    public function verifyEmail(Request $request)
    {
        $token = $request->query('token');

        $record = \DB::table('email_verifications')->where('token', $token)->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid verification link'], 400);
        }

        Usuario::where('id', $record->usuario_id)->update([
            'email_verified_at' => Carbon::now()
        ]);

        // Delete token after verification
        \DB::table('email_verifications')->where('id', $record->id)->delete();

        return response()->json(['message' => 'Email verified successfully. You can now log in.']);
    }

    // 3️⃣ Login endpoint
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = Usuario::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Please verify your email first'], 403);
        }

        // Optionally, generate a session token
        $loginToken = Str::uuid();

        return response()->json([
            'message' => 'Login successful',
            'login_token' => $loginToken,
            'user' => $user
        ]);
    }
}
