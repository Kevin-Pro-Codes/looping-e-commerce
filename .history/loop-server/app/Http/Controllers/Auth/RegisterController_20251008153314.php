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
   
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
             return response()->json([
        'received' => $request->all()
    ]);
        }

      
    $user = User::create([
    'name' => $request->nome,
    'email' => $request->email,
    'password' => Hash::make($request->password),
]);


$user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user
        ]);
    }
}
