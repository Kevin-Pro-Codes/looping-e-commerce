<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');



Route::get('/profile', function () {
    return view('profile');
})->middleware('auth');

Route::post('/api/login', function (Request $request) {
    $request->validate([
        'email' => ['required','email'],
        'password' => ['required']
    ]);

    if (Auth::attempt($request->only('email', 'password'))) {
        $request->session()->regenerate();
        return response()->json([
            'message' => 'Login successful',
            'user' => Auth::user()
        ]);
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
});