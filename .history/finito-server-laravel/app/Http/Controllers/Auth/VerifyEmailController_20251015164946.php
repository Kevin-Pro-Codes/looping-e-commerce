<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Controller;

class VerifyEmailController extends Controller
{
public function __invoke(EmailVerificationRequest $request): RedirectResponse
{

    $user = \App\Models\User::findOrFail($request->route('id'));

    if ($user->hasVerifiedEmail()) {
        return redirect()->to(config('app.FRONTEND_URL').'/perfil?verified=1');
    }

    if ($user->markEmailAsVerified()) {
        event(new Verified($user));
    }

    return redirect()->to(config('app.FRONTEND_URL').'/perfil?verified=1');
}
}
