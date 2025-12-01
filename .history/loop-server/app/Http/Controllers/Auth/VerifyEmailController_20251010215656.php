<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class VerifyEmailController extends Controller
{
    /**
     * Handle the email verification for the user.
     */
    public function verify(EmailVerificationRequest $request)
    {
        $request->fulfill(); // marks email as verified

        // Redirect to React frontend
        return redirect('http://localhost:3000/email-verified?user=' . $request->user()->id);
    }
}
