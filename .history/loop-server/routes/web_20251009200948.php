<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Models\User;
use Laravel\Sanctum\Sanctum;




{/*
Route::get('/', function () {return view('welcome.blade.php');});
*/}

Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS test successful',
        'status' => 'success'
    ]);
});



Route::middleware('web')->group(function () {

Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent(); 
});

    Route::post('/login', [AuthenticatedSessionController::class, 'login']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'logout']);  
    Route::post('/register', function (Request $request) {
      
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // password_confirmation required
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
     
        Auth::login($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ]);
    });
});





