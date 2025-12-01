<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;


class RegisterController extends Controller
{
    public function register(Request $request)
    {
   
          $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6|confirmed',
    ]);

    $user = User::create([
        'nome' => $request->nome,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    // Send email verification
    $user->sendEmailVerificationNotification();

    return response()->json([
        'message' => 'Conta criada! Verifique seu e-mail para ativar sua conta.',
    ]);


    }
}
