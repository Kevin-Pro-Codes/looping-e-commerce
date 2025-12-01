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

        // 🔑 Associate with currently logged-in user
        $data['user_id'] = Auth::id();

        $address = Address::create($data);

        return response()->json($address, 201);
    }
}
