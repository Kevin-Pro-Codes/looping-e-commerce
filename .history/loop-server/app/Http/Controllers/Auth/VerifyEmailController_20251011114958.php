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
        // ✅ Validate signed URL
        if (! $request->hasValidSignature()) {
            return redirect('http://localhost:3000/email-verified?status=failed');
        }

        $user = User::findOrFail($id);

        // ✅ Validate hash matches user email
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect('http://localhost:3000/email-verified?status=failed');
        }

        // ✅ Mark email verified
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // ✅ Redirect to React
        return redirect('http://localhost:3000/email-verified?status=success');
    }
}
