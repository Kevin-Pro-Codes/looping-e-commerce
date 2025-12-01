<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;


class LoginController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
    
        // Use sanctum guard for API authentication
        if (Auth::guard('sanctum')->attempt($request->only('email', 'password'))) {
            $user = Auth::guard('sanctum')->user();
            
            if (!$user->is_verified) {
                return response()->json(['message' => 'Conta não verificada'], 403);
            }
    
            $token = $user->createToken('api-token')->plainTextToken;
    
            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'is_admin' => $user->is_admin,
            ]);
        }
    
        return response()->json(['message' => 'Credenciais inválidas'], 401);
    }


    public function logout(Request $request)
    {
         Cookie::queue(Cookie::forget('laravel_session'));
         Cookie::queue(Cookie::forget('XSRF-TOKEN'));

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    protected function redirectTo()
{
    return 'http://localhost:3000/perfil';
}
}

