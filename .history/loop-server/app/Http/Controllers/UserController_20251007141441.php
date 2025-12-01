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
        $user->update($request->only(['nome', 'email', 'telefone', 'cpf', 'data_nascimento', 'receber_marketing']));
        return response()->json($user);
    }
}

\App\Models\User::all();