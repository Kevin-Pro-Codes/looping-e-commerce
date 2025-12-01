<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    /**
     * List all addresses for the authenticated user's profile
     */
    public function index()
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json($profile->addresses);

    }

    /**
     * Show a single address by ID for the authenticated user's profile
     */
    public function show($id)
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $address = $profile->addresses()->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        return response()->json($address);
    }

    /**
     * Create a new address for the authenticated user's profile
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $data = $request->validate([
            'street' => 'required|string|max:255',
            'number' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
        ]);

        $data['profile_id'] = $profile->id;
        $address = Address::create($data);

        return response()->json($address, 201);
    }

    /**
     * Update an existing address belonging to the authenticated user
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $address = $profile->addresses()->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $validated = $request->validate([
            'street' => 'sometimes|string|max:255',
            'number' => 'nullable|string|max:50',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'zip' => 'sometimes|string|max:20',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    /**
     * Delete an address belonging to the authenticated user
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $address = $profile->addresses()->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $address->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
