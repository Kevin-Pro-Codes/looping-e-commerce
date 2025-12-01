<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'street' => 'required|string|max:255',
            'number' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
        ]);

        $data['user_id'] = Auth::id();
        $address = Address::create($data);
        return response()->json($address, 201);
    }

    // 🔥 ADD THIS UPDATE METHOD:
    public function update(Request $request, $id)
    {
        $address = Address::findOrFail($id);
        if ($address->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'street' => 'required|string|max:255',
            'number' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
        ]);

        $address->update($data);
        return response()->json($address);
    }

    // 🔥 ADD THIS INDEX (for profile load):
    public function index()
    {
        return response()->json(Auth::user()->addresses);
    }
}