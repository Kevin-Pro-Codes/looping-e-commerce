<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Only needed if you want server-side redirect login
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

   const handleGoogleSuccess = async (response) => {
  console.log('Full Google response:', response);
  console.log('Response credential:', response.credential);
  console.log('Response access_token:', response.access_token);
  console.log('Response keys:', Object.keys(response));
  
  try {

    if (!response) {
      throw new Error('Google response is null');
    }
    
    const token = response.credential || response.access_token || response.token;
    
    if (!token) {
      console.error('No token found in response:', response);
      throw new Error('No authentication token received from Google');
    }

    const res = await fetch('http://localhost:8000/api/auth/google/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Authentication failed');
    }

    const data = await res.json();
    console.log('Login successful:', data);
    
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
  }
};

    // ✅ New method for React SPA token login
    public function loginWithGoogle(Request $request)
    {
        $token = $request->input('token'); // token sent from React

        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            $user = \App\Models\User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            auth()->login($user);

            return response()->json(['user' => $user]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
