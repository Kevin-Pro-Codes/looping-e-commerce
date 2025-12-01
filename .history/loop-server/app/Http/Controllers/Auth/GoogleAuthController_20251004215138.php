<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Http;

public function handleCallback(Request $request)
{
    $googleToken = $request->input('token');

    \Log::info('Google token received: ' . $googleToken);

    return response()->json([
        'token_received' => $googleToken,
    ]);
}
