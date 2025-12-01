<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use App\Models\User;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request)
    {
        // Validate signed URL
        if (! $request->hasValidSignature()) {
            return redirect(config('app.frontend_url').'/login?invalid=1');
        }

        // Find user by ID from URL
        $user = User::find($request->route('id'));
        if (! $user) {
            return redirect(config('app.frontend_url').'/login?user_not_found=1');
        }

        // Already verified
        if ($user->hasVerifiedEmail()) {
            return redirect(config('app.frontend_url').'/email-verified?already_verified=1');
        }

        // Mark email as verified
        $user->markEmailAsVerified(); // updates email_verified_at
        $user->is_verified = 1;       // set your custom column
        $user->save();

        event(new Verified($user));

        // Redirect to SPA page
        return redirect(config('app.frontend_url').'/perfil?verified=1');
    }
}
