<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Show a single user by ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */

 public function index()
    {
        $mysqlUsers = User::all();
        $mongoUsers = UserMongo::all();

        return response()->json([
            'mysql_users' => $mysqlUsers,
            'mongo_users' => $mongoUsers,
        ]);
    }

    public function show($id)
    {
        // Find the user by ID
        $user = User::find($id);

        // If user not found, return 404
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Return selected user fields
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ], 200);
    }
}
