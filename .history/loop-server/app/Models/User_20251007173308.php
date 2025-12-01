<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::find($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        $user->update($request->only([
            'nome',
            'email',
            'telefone',
            'cpf',
            'data_nascimento',
            'avatar',
            'receber_marketing'
        ]));

        return response()->json($user);
    }
}
