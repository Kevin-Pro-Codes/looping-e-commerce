import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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
      await axios.get("/sanctum/csrf-cookie");

      const res = await axios.post("/login", { email, password }, {
        withXSRFToken: true,
        withCredentials: true,
        headers: { Accept: "application/json" }
      });

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
     
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        }
        navigate("/loading");
      }
 
      updateGlobalAuthState();

      alert(res.data.message || "Login successful!");
      navigate("/perfil");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

const handleGoogleLogin = async ({ access_token }) => {
  try {
    console.clear();
    console.log("🔥 1. GOOGLE TOKEN OK");

    // 🔥 STEP 1: GET CSRF COOKIE
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", { 
      withCredentials: true 
    });
    console.log("🔥 2. CSRF COOKIE OK");

    // 🔥 STEP 2: READ XSRF FROM COOKIE
    const xsrfCookie = document.cookie.split(';').find(row => row.startsWith('XSRF-TOKEN='));
    const xsrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : null;
    console.log("🔥 3. XSRF TOKEN:", xsrfToken ? "OK" : "🚨 MISSING!");

    if (!xsrfToken) throw new Error("NO CSRF TOKEN");

    // 🔥 STEP 3: POST WITH EXACT HEADERS
    const response = await axios.post("http://localhost:8000/google-auth", 
      { token: access_token },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': xsrfToken,  // ← CRITICAL!
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    console.log("✅ 4. SUCCESS:", response.data);
    
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    updateGlobalAuthState();
    alert("✅ GOOGLE LOGIN SUCCESS!");
    navigate("/perfil");

  } catch (error) {
    console.error("💥 URL:", error.config?.url);
    console.error("💥 STATUS:", error.response?.status);
    console.error("💥 HEADERS SENT:", error.config?.headers);
    console.error("💥 COOKIES:", document.cookie);
    alert("ERROR: " + (error.response?.data?.message || error.message));
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