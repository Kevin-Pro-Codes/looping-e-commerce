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

        $user->update($request->only(['name', 'email', 'phone', 'cpf', 'birthDate', 'avatar', 'marketingOptIn']));

        // Optionally, update addresses and payments if sent
        if ($request->has('addresses')) {
            foreach ($request->addresses as $addr) {
                // Either update existing or create
                $address = $user->addresses()->updateOrCreate(['id' => $addr['id'] ?? null], $addr);
            }
        }

        if ($request->has('payment')) {
            foreach ($request->payment as $pay) {
                $payment = $user->payments()->updateOrCreate(['id' => $pay['id'] ?? null], $pay);
            }
        }

        return response()->json($user->load(['addresses', 'payments']));
    }
}
