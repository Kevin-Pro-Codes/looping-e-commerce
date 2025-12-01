<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerifyEmail extends Controller
{
    /**
     * Verify email link handler.
     *
     * @param  int     $id
     * @param  string  $hash
     * @param  Request $request
     */
    public function verify($id, $hash, Request $request)
    {
        // Load user or 404
        $user = User::findOrFail($id);

        // Validate the hash (sha1 of the email)
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/email-verified?status=failed');
        }

        // If user is not yet verified, update via direct DB query (forced)
        if (! $user->hasVerifiedEmail()) {
            DB::table('users')->where('id', $user->id)->update([
                'is_verified' => 1,
                'email_verified_at' => now(),
            ]);

            // refresh the Eloquent model so $user has fresh values
            $user->refresh();

            // Fire the Verified event (listeners expect a User instance)
            event(new Verified($user));
        }

        // Redirect to front-end. Use FRONTEND_URL in .env for flexibility.
        return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/email-verified?user=' . $user->id);
    }
}
