<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class ResendVerificationController extends Controller
{
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No user found with this email address.'
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.'
            ], 400);
        }

        // Check if we've sent too many attempts
        if ($this->tooManyAttempts($user)) {
            return response()->json([
                'message' => 'Too many verification attempts. Please try again in 5 minutes.'
            ], 429);
        }

        // Send verification notification
        $user->sendEmailVerificationNotification();

        // Update attempt count and timestamp
        $this->updateAttempts($user);

        return response()->json([
            'message' => 'Verification email sent successfully!'
        ], 200);
    }

    private function tooManyAttempts(User $user): bool
    {
        $lastAttempt = $user->verification_sent_at;
        $attemptCount = $user->verification_attempts ?? 0;

        if (!$lastAttempt) {
            return false;
        }

        // Reset attempts if more than 5 minutes have passed
        if (now()->diffInMinutes($lastAttempt) > 5) {
            $user->update([
                'verification_attempts' => 0,
                'verification_sent_at' => null
            ]);
            return false;
        }

        // Allow max 3 attempts in 5 minutes
        return $attemptCount >= 3;
    }

    private function updateAttempts(User $user)
    {
        $user->update([
            'verification_attempts' => ($user->verification_attempts ?? 0) + 1,
            'verification_sent_at' => now()
        ]);
    }
}