<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

use Illuminate\Foundation\Auth\EmailVerificationRequest;
public function verify(EmailVerificationRequest $request)
{
    $request->fulfill(); // marca email como verificado

    return redirect('http://localhost:3000/email-verified?user=' . $request->user()->id);
}