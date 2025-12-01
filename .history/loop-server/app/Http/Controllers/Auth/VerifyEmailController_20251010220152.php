<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class VerifyEmailController extends Controller
{
    public function verify(EmailVerificationRequest $request)
    {
        $request->fulfill(); // mark email as verified

        // Redirect directly to React app
        return redirect('http://localhost:3000/email-verified');
    }
}