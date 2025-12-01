<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller

{
    public function verify($id, $hash, Request $request)
    {
        $user = User::findOrFail($id);

        // Add debug logging
        \Log::info('Verification attempt', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_verified_email' => $user->hasVerifiedEmail(),
            'current_email_verified_at' => $user->email_verified_at,
            'current_is_verified' => $user->is_verified
        ]);

        // Check if the hash matches
        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            \Log::error('Hash mismatch for user: ' . $user->id);
            return redirect('http://localhost:3000/email-verified?status=failed');
        }

        // FIX: Check if email is NOT verified yet
        if (!$user->hasVerifiedEmail()) {
            $user->email_verified_at = now();
            $user->is_verified = 1;
            
            if ($user->save()) {
                \Log::info('User verified successfully', [
                    'user_id' => $user->id,
                    'email_verified_at' => $user->email_verified_at,
                    'is_verified' => $user->is_verified
                ]);
                
                event(new Verified($user));
            } else {
                \Log::error('Failed to save user verification');
                return redirect('http://localhost:3000/email-verified?status=failed');
            }
        } else {
            \Log::info('Email already verified for user: ' . $user->id);
        }

        return redirect('http://localhost:3000/perfil');
    }
}