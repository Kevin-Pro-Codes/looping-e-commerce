<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function show()
    {
        $userId = Auth::id();
        $profile = Profile::where('user_id', $userId)->first();
        if (!$profile) {
            return response()->json(['error' => 'Profile not found'], 404);
        }
        return response()->json($profile);
    }

   public function update(Request $request)
{
    $userId = Auth::id();
    $profile = Profile::where('user_id', $userId)->first();

    if (!$profile) {
        return response()->json(['error' => 'Profile not found'], 404);
    }

    $profile->update($request->only([
        'name',
        'email',
        'tel',
        'cpf',
        'birth_date',
        'avatar',
        'marketing'
    ]));

    return response()->json($profile);
}

}
