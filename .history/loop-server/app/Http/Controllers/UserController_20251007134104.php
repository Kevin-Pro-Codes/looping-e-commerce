<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getProfile(Request $request) {
        return $request->user(); // returns logged-in user's profile
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $user->update($request->only(['name', 'email', 'phone', 'cpf', 'birthDate', 'marketingOptIn']));
        return response()->json($user);
    }
}
