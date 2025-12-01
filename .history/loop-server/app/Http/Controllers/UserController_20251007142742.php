<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getProfile(Request $request) {
        return $request->user(); // returns logged-in user's profile
    }


}

\App\Models\User::all();