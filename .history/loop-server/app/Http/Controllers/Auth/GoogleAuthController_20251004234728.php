<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class GoogleAuthController extends Controller
{
    const handleGoogleSuccess = async (googleResponse) => {
  try {
    // Make sure the token exists
    const token = googleResponse?.credential || googleResponse?.access_token;
    if (!token) {
      throw new Error("No Google token received from Google API");
    }

    console.log("Google token:", token);

    const response = await fetch("http://localhost:8000/api/auth/google/callback", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        token: token,
        name: googleResponse?.profileObj?.name || "No Name" // optional
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Network response was not ok");
    }

    const data = await response.json();
    console.log("Registration successful:", data);

    localStorage.setItem("token", data.access_token);
    navigate("/dashboard");

  } catch (error) {
    console.error("Error:", error);
    alert("Erro ao registrar com Google: " + error.message);
  }
};

}
