<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerifyEmail extends Controller
{
    public function verify($id, $hash, Request $request)
{
    $user = User::findOrFail($id);

    if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
        return redirect('http://localhost:3000/login?status=failed');
    }

    if (!$user->hasVerifiedEmail()) {
        $user->email_verified_at = now();
        $user->is_verified = 1;
        
        if ($user->save()) {
            event(new Verified($user));
        } else {
            return redirect('http://localhost:3000/login?status=failed');
        }
    }

    return redirect('http://localhost:3000/login?status=success');
}

}