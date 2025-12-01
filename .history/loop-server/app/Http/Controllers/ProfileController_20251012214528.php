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
        $userId = Auth::id();

        // Find profile by authenticated user's id
        $profile = Profile::where('id', $userId)->first();

        // Create new profile if not exists
        if (!$profile) {
            $profile = Profile::create([
                'id' => $userId, // assign same id as user
                'name' => '',
                'email' => Auth::user()->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'marketing' => true,
            ]);
        }

        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $id = Auth::id();

        $profile = Profile::where('id', $userId)->first();

        if (!$profile) {
            $profile = Profile::create([
                'id' => $id,
                'name' => '',
                'email' => Auth::user()->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'marketing' => true,
            ]);
        }

        $profile->update($request->only([
            'name',
            'email',
            'tel',
            'cpf',
            'birth_date',
            'avatar',
            'marketing'
        ]));

        return response()->json($profile);
    }
}
