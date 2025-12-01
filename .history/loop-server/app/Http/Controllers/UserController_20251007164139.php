<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = User::with('enderecos', 'payment')->find($request->user()->id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->nome ?? '',
            'email' => $user->email ?? '',
            'phone' => $user->telefone ?? '',
            'cpf' => $user->cpf ?? '',
            'birthDate' => $user->data_nascimento ?? '',
            'avatar' => $user->avatar ?? '',
            'marketingOptIn' => $user->receber_marketing ?? false,
            'addresses' => $user->enderecos ?? [], // default empty array
            'payment' => $user->payment ?? []      // default empty array
        ]);
    }
}
