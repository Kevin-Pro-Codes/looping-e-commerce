<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $profile = Profile::firstWhere('email', $user->email);
        return response()->json($profile ? $profile->addresses : []);
    }

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

    public function update(Request $request, $id)
    {
        $address = Address::findOrFail($id);
        $address->update($request->only(['street', 'number', 'city', 'state', 'zip']));
        return response()->json($address);
    }

    public function destroy($id)
    {
        Address::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
