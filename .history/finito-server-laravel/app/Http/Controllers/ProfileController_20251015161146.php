<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Show the authenticated user's profile.
     * Lazily creates a profile if it does not exist.
     */
    public function show()
    {
        $userId = Auth::id();

        $profile = Profile::find($userId);

        if (!$profile) {
            $profile = Profile::create([
                'id' => $userId,
                'name' => '',
                'email' => Auth::user()->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'receber_marketing' => true,
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
            'receber_marketing' => $profile->receber_marketing,
            'addresses' => [], // you can populate later
            'payment' => [],   // you can populate later
        ]);
    }

    /**
     * Update the authenticated user's profile.
     * Does NOT create a new profile; only updates existing one.
     */
    public function update(Request $request)
    {
        $userId = Auth::id();

        $profile = Profile::find($userId);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Validate input
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:profile,email,' . $userId,
            'tel' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'avatar' => 'nullable|url',
            'receber_marketing' => 'nullable|boolean',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }
}
