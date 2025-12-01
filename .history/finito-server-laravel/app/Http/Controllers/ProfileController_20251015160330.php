<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
  // 🔥 REPLACE YOUR show() METHOD:
public function show()
{
    $userId = Auth::id();
    $profile = Profile::where('id', $userId)->first();

    if (!$profile) {
        $profile = Profile::create([
            'id' => $userId,
            'name' => '',
            'email' => Auth::user()->email,
            'tel' => '',
            'cpf' => '',
            'birth_date' => null,
            'avatar' => '',
            'receber_marketing' => true,  // ← CHANGED!
        ]);
    }

    return response()->json([
        'id' => $profile->id,
        'name' => $profile->name,
        'email' => $profile->email,
        'tel' => $profile->tel,
        'cpf' => $profile->cpf,
        'birth_date' => $profile->birth_date,
        'avatar' => $profile->avatar,
        'receber_marketing' => $profile->receber_marketing,  // ← CHANGED!
        'addresses' => [],
        'payment' => []
    ]);
}

// 🔥 REPLACE YOUR update() METHOD:
public function update(Request $request)
{
    $userId = Auth::id();
    $profile = Profile::where('id', $userId)->first();

    if (!$profile) {
        $profile = Profile::create([
            'id' => $userId,
            'name' => '',
            'email' => Auth::user()->email,
            'tel' => '',
            'cpf' => '',
            'birth_date' => null,
            'avatar' => '',
            'receber_marketing' => true,  // ← CHANGED!
        ]);
    }

    $profile->update($request->only([
        'name', 'email', 'tel', 'cpf', 'birth_date', 'avatar', 'receber_marketing'  // ← CHANGED!
    ]));

    return response()->json($profile);
}
}
