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
        $user = Auth::user();

        // Try finding the profile by email (since no user_id)
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            $profile = Profile::create([
                'name' => $user->name ?? '',
                'email' => $user->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,
                'avatar' => '',
                'marketing' => false,
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
            'marketing' => $profile->marketing,
            'addresses' => [],
            'payment' => [],
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Find the profile by email instead of ID
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:profile,email,' . $profile->id,
            'tel' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'avatar' => 'nullable|url',
            'marketing' => 'nullable|boolean',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }
}
