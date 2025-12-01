<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Auth;
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
    return response()->noContent(); // Laravel will set the XSRF-TOKEN cookie automatically
});

    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // ✅ Fixed registration route
    Route::post('/register', function (Request $request) {
        // ✅ Use $request (the instance), NOT the facade
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // password_confirmation required
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Log user in
        Auth::login($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ]);
    });
});





