<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json([
                'message' => 'Se o email existir, um link de redefinição será enviado.'
            ]);
        }

        // Generate reset token
        $token = Str::random(64);
        
        // Store token in database (expires in 1 hour)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token, // Store plain token (not hashed for simplicity)
                'created_at' => Carbon::now()
            ]
        );

        // Send email with reset link
        try {
            $resetUrl = "http://localhost:3000/reset-password?token=" . $token . "&email=" . urlencode($user->email);
            
            Mail::send('emails.password-reset', ['resetUrl' => $resetUrl], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Redefinir sua senha - Looping');
            });
            
            return response()->json([
                'message' => 'Link de redefinição enviado para seu email!'
            ]);
        } catch (\Exception $e) {
            \Log::error('Email error: ' . $e->getMessage());
            return response::json([
                'message' => 'Erro ao enviar email. Tente novamente.'
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed'
        ]);

        $resetRecord = DB::table('password_reset_tokens')
                        ->where('email', $request->email)
                        ->where('token', $request->token)
                        ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Token inválido ou expirado'
            ], 400);
        }

        // Check if token is expired (1 hour)
        if (Carbon::parse($resetRecord->created_at)->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Token expirado. Solicite um novo link.'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Senha redefinida com sucesso!'
        ]);
    }

    // Add this method to check token validity
    public function checkToken(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email'
        ]);

        $resetRecord = DB::table('password_reset_tokens')
                        ->where('email', $request->email)
                        ->where('token', $request->token)
                        ->first();

        if (!$resetRecord) {
            return response()->json(['valid' => false], 400);
        }

        // Check expiration
        if (Carbon::parse($resetRecord->created_at)->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['valid' => false], 400);
        }

        return response()->json(['valid' => true]);
    }
}