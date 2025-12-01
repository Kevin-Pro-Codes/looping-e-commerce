<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    public function verify(Request $request, $id, $hash)
    {
        // Ensure the URL signature is valid
        if (! $request->hasValidSignature()) {
            return redirect('http://localhost:3000/email-verified?status=failed');
        }

        $user = User::findOrFail($id);

        // Ensure hash matches user email
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect('http://localhost:3000/email-verified?status=failed');
        }

        // Mark verified if not yet verified
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect('http://localhost:3000/email-verified?status=success');
    }
}
