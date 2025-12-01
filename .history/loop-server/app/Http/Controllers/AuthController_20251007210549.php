<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\Usuario;
use Carbon\Carbon;
use App\Mail\VerifyEmail;


class AuthController extends Controller
{
 public function register(Request $request)
{
    try {
        // 1️⃣ Validate the request
        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6|confirmed'
        ]);

        // 2️⃣ Create the user
        $user = Usuario::create([
            'nome' => $request->nome,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        // 3️⃣ Create email verification token
        $token = Str::uuid();
        \DB::table('email_verifications')->insert([
            'usuario_id' => $user->id,
            'token' => $token,
            'created_at' => now()
        ]);

        $verificationLink = url("/verify-email?token=$token");

     Mail::to($user->email)->send(new VerifyEmail($user, $token));

        // 5️⃣ Generate Sanctum API token for frontend
        $apiToken = $user->createToken('auth_token')->plainTextToken;

        // 6️⃣ Return JSON response with token and user info
        return response()->json([
            'message' => 'Registration successful. Check your email to verify your account.',
            'access_token' => $apiToken,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Something went wrong: '.$e->getMessage()
        ], 500);
    }


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
