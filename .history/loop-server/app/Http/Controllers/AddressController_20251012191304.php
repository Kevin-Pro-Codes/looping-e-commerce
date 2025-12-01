<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    // List all addresses for the authenticated user
    public function index()
    {
        return response()->json(auth()->user()->addresses);
    }

    // Store a new address
    public function store(Request $request)
    {
        $validated = $request->validate([
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:50',
            'city'   => 'required|string|max:100',
            'state'  => 'required|string|max:100',
            'zip'    => 'required|string|max:20',
        ]);

        $validated['user_id'] = auth()->id();

        $address = Address::create($validated);

        return response()->json([
            'message' => 'Address saved successfully!',
            'address' => $address,
        ]);
    }

    // Delete an address
    public function destroy(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully.']);
    }
}
