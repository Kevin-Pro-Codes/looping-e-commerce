<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;

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
        $profile = Profile::firstWhere('email', $user->email);

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
            'id' => $profile->id,
            'name' => $profile->name,
            'email' => $profile->email,
            'tel' => $profile->tel,
            'cpf' => $profile->cpf,
            'birth_date' => $profile->birth_date,           
            'marketing' => $profile->marketing,

            'addresses' => [], // you can load real addresses if needed

            'payment' => [],   // you can load real payment order if needed
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Find the profile by email (or create if missing)
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            // Create profile if it doesn't exist
            $profile = Profile::create([
                'name' => $user->name ?? '',
                'email' => $user->email,
                'tel' => '',
                'cpf' => '',
                'birth_date' => null,        
                'marketing' => false,
            ]);
        }

        // Validate incoming request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:profile,email,' . $profile->id,
            'tel' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',        
            'marketing' => 'nullable|boolean',
        ]);

        // ✅ Update the profile, not the user
        $profile->update($validated);

        return response()->json([
            'id' => $profile->id,
            'name' => $profile->name,
            'email' => $profile->email,
            'tel' => $profile->tel,
            'cpf' => $profile->cpf,
            'birth_date' => $profile->birth_date,      
            'marketing' => $profile->marketing,

            'addresses' => [], // load real addresses if needed

            'payment' => [],   // load real payment order if needed
        ]);
    }

    /**
     * Delete the authenticated user's account.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();

        // Validate password for account deletion
        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Invalid password',
                'errors' => $e->errors()
            ], 422);
        }

        // Delete the user's profile if it exists
        $profile = Profile::firstWhere('email', $user->email);
        if ($profile) {
            $profile->delete();
        }

        // Delete the user account
        $user->delete();

        return response()->json(['message' => 'Account deleted']);
    }
}
