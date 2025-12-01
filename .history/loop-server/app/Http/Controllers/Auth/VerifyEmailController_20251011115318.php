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
        // ✅ Validate the signed URL
        if (! $request->hasValidSignature()) {
            return redirect(env('FRONTEND_URL') . '/email-verified?status=failed');
        }

        $user = User::findOrFail($id);

        // ✅ Validate the hash
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect(env('FRONTEND_URL') . '/email-verified?status=failed');
        }

        // ✅ Mark as verified
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // ✅ Redirect to React page, including user ID in the URL
        return redirect(env('FRONTEND_URL') . '/email-verified?user=' . $user->id);
    }
}
