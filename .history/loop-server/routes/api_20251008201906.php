<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

{/*
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});
*/} 


Route::post('/login', function(Request $request){
    $user = User::where('email', $request->email)->first();
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message'=>'Invalid credentials'], 401);
    }
    $token = $user->createToken('api-token')->plainTextToken;
    return response()->json(['token'=>$token, 'user'=>$user]);
});