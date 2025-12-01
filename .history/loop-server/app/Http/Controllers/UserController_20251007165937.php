<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::with('enderecos', 'payment')->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'nome' => $request->input('name'),
            'email' => $request->input('email'),
            'telefone' => $request->input('phone'),
            'cpf' => $request->input('cpf'),
            'data_nascimento' => $request->input('birthDate'),
            'receber_marketing' => $request->input('marketingOptIn', false),
        ]);

        return response()->json($user);
    }
}
