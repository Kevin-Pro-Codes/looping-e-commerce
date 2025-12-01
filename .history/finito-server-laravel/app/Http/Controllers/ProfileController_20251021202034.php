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

        // Try finding the profile by email (or create if missing)
        $profiles = Profiles::firstWhere('email', $user->email);

        if (!$profile) {
            $profile = Profile::create([
                'name' => $user->name ?? '',
                'email' => $user->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,        
                'marketing' => false,
            ]);
        }

        return response()->json([
            'id' => $profiles->id,
            'name' => $profiles->name,
            'email' => $profiles->email,
            'tel' => $profiles->tel,
            'cpf' => $profiles->cpf,
            'birth_date' => $profiles->birth_date,           
            'marketing' => $profiles->marketing,

            'addresses' => [], // you can load real addresses if needed

            'payment' => [],   // you can load real payment info if needed
        ]);
    }

    /**
     * Update the authenticated user's profiles.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Find the profiles by email
        $profiles = Profiles::firstWhere('email', $user->email);

        if (!$profiles) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Validate incoming request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:profiles,email,' . $profiles->id,
            'tel' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',        
            'marketing' => 'nullable|boolean',
        ]);

        // ✅ Update the profile, not the user
        $profiles->update($validated);

        return response()->json([
            'id' => $profiles->id,
            'name' => $profiles->name,
            'email' => $profiles->email,
            'tel' => $profiles->tel,
            'cpf' => $profiles->cpf,
            'birth_date' => $profiles->birth_date,      
            'marketing' => $profiles->marketing,

            'addresses' => [], // load real addresses if needed

            'payment' => [],   // load real payment info if needed
        ]);
    }
}
