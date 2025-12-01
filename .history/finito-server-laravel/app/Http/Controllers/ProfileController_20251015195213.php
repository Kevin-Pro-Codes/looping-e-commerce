<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Show the authenticated user's profile with addresses.
     */
    public function show()
    {
        $user = Auth::user();

        // Find profile by email (since there's no user_id column)
        $profile = Profile::with('addresses')->firstWhere('email', $user->email);

        // Lazily create profile if not found
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
            'addresses' => $profile->addresses, // now loads real addresses
            'payment' => [],
        ]);
    }

    /**
     * Update profile and optionally addresses.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $profile = Profile::with('addresses')->firstWhere('email', $user->email);
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Validate profile fields
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:profile,email,' . $profile->id,
            'tel' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'avatar' => 'nullable|url',
            'marketing' => 'nullable|boolean',
            // addresses as array
            'addresses' => 'nullable|array',
            'addresses.*.id' => 'nullable|integer|exists:addresses,id',
            'addresses.*.street' => 'required_with:addresses|string|max:255',
            'addresses.*.number' => 'nullable|string|max:20',
            'addresses.*.city' => 'required_with:addresses|string|max:100',
            'addresses.*.state' => 'required_with:addresses|string|max:100',
            'addresses.*.zip' => 'required_with:addresses|string|max:20',
        ]);

        // Update profile info
        $profile->update($validated);

        // Handle addresses if present
        if ($request->has('addresses')) {
            foreach ($request->addresses as $addrData) {
                if (isset($addrData['id'])) {
                    // Update existing address
                    $address = $profile->addresses()->find($addrData['id']);
                    if ($address) {
                        $address->update($addrData);
                    }
                } else {
                    // Create new address
                    $profile->addresses()->create($addrData);
                }
            }
        }

        // Return updated profile with addresses
        return response()->json(
            $profile->load('addresses')
        );
    }
}
