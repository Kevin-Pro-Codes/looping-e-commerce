import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import gmailLogo from "../assets/gmail.png";
import microsoftLogo from "../assets/microsoft.png";
import yahooLogo from "../assets/yahoo.png";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();



  const updateGlobalAuthState = () => {
    // Update localStorage
    localStorage.setItem("loggedIn", "true");
    
    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event("loginStateChange"));
    
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent("storage", {
      key: "loggedIn",
      newValue: "true"
    }));
  };

  

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ Get CSRF cookie from Sanctum
    console.log("Fetching CSRF cookie...");
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include", // important for cookies
    });

    // 2️⃣ Extract CSRF token from cookies
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!csrfToken) throw new Error("CSRF token not found");

    // 3️⃣ Send login credentials
    console.log("Sending login credentials...");
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ email, password }),
    });

    // 4️⃣ Parse response
    const data = await res.json();

    if (data.success) {
      if (data.user.type === 'admin@finito') {
        // redirect to AdminPanel
        navigate('/admin');
      } 
    }

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    console.log("Login response:", data);
    console.log("Token from response:", data.token);

    // 5️⃣ Save user and token
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("User saved to localStorage");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      console.log("Token saved to localStorage:", data.token);
    } 

    
    if (data.success && data.is_admin) {
      localStorage.setItem("isAdmin", "true");
      updateGlobalAuthState();
      alert("Admin login successful!");
      navigate("/admin");
    } else if (data.success) {
      updateGlobalAuthState();
      alert(data.message || "Login successful!");
      navigate("/profile");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert(err.message || "Login failed");
  }
};


const handleGoogleLogin = async (response) => {
  try {
    console.log("Google response:", response);
    const googleToken = response.access_token;
    if (!googleToken) throw new Error("Google access token not found");

    // 1️⃣ Get CSRF cookie (required by Sanctum)
    console.log("Getting CSRF cookie...");
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include", // include cookies
    });

    // 2️⃣ Extract CSRF token from document.cookie
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!csrfToken) throw new Error("CSRF token not found");

    // 3️⃣ Send Google token to backend
    console.log("Sending Google token to backend...");
    const res = await fetch("http://localhost:8000/google-auth", {
      method: "POST",
      credentials: "include", // keep Sanctum cookies
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Google authentication failed");
    }

    const data = await res.json();
    console.log("Backend response:", data);

    // 4️⃣ Handle successful login
    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      // Update your global auth state
      updateGlobalAuthState();

      navigate("/loading");
    } else {
      throw new Error(data.error || "Authentication failed");
    }
  } catch (error) {
    console.error("Full Google auth error:", error);
    alert("Erro ao fazer login com Google: " + error.message);
  }
};




  const handleGoogleError = () => {
    console.log("Login com Google falhou");
    alert("Erro ao fazer login com Google.");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: handleGoogleError,
    flow: "implicit",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Login</h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg shadow-sm">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

{/*
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
*/}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input with Eye */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm"
          >
            Entrar
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <button 
              onClick={() => navigate("/registrar")}
              className="text-blue-500 hover:text-red-600 font-medium"
            >
              Registrar-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}