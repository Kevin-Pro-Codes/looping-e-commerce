<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\Address; // ✅ Add this
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

        // ✅ Fetch addresses for this profile
        $addresses = Address::where('profile_id', $profile->id)->get();

        return response()->json([
            'id' => $profile->id,
            'name' => $profile->name,
            'email' => $profile->email,
            'tel' => $profile->tel,
            'cpf' => $profile->cpf,
            'birth_date' => $profile->birth_date,
            'avatar' => $profile->avatar,
            'marketing' => $profile->marketing,
            'addresses' => $addresses, // ✅ Include addresses
            'payment' => [], // placeholder for future data
        ]);
    }

    /**
     * Update the authenticated user's profile and addresses.
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
            'addresses' => 'array',
            'addresses.*.id' => 'nullable|integer|exists:addresses,id',
            'addresses.*.street' => 'required_with:addresses|string|max:255',
            'addresses.*.number' => 'nullable|string|max:50',
            'addresses.*.city' => 'required_with:addresses|string|max:100',
            'addresses.*.state' => 'required_with:addresses|string|max:100',
            'addresses.*.zip' => 'required_with:addresses|string|max:20',
        ]);

        // ✅ Update the profile itself
        $profile->update($validated);

        // ✅ Handle address creation or update
        if ($request->has('addresses')) {
            foreach ($request->addresses as $addr) {
                if (isset($addr['id'])) {
                    // Update existing
                    Address::where('id', $addr['id'])
                        ->where('profile_id', $profile->id)
                        ->update($addr);
                } else {
                    // Create new
                    $profile->addresses()->create($addr);
                }
            }
        }

        // ✅ Return updated profile with addresses
        $profile->load('addresses');

        return response()->json($profile);
    }
}
