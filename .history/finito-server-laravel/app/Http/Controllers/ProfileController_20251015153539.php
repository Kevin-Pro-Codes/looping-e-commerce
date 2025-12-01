<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function show()
    {
        $profile = Profile::firstOrCreate(
            ['id' => Auth::id()],
            [
                'email' => Auth::user()->email,
                'name' => '',
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'marketing' => true,
            ]
        );

        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $profile = Profile::firstOrCreate(
            ['id' => Auth::id()],
            [
                'email' => Auth::user()->email,
                'name' => '',
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'marketing' => true,
            ]
        );

        $profile->update($request->only([
            'name', 'email', 'tel', 'cpf', 'birth_date', 'avatar', 'marketing'
        ]));

        return response()->json($profile);
    }
}
