import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import ApiAuth from "../api/ApiAuth"; // ✅ import your configured Axios instance

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 🔄 Keep your global auth state logic
  const updateGlobalAuthState = () => {
    localStorage.setItem("loggedIn", "true");
    window.dispatchEvent(new Event("loginStateChange"));
    window.dispatchEvent(
      new StorageEvent("storage", { key: "loggedIn", newValue: "true" })
    );
  };

  // ✅ Normal email/password login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Step 1: get CSRF cookie
      await ApiAuth.get("/sanctum/csrf-cookie");

      // Step 2: login
      const res = await ApiAuth.post("/login", { email, password });

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          ApiAuth.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        }

        updateGlobalAuthState();
        alert(res.data.message || "Login successful!");
        navigate("/perfil");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // ✅ Google login with ApiAuth
  const handleGoogleLogin = async (response) => {
    try {
      console.log("Google response:", response);
      const googleToken = response.access_token;
      if (!googleToken) throw new Error("Google access token not found");

      // Step 1: Get CSRF cookie
      console.log("Getting CSRF cookie...");
      await ApiAuth.get("/sanctum/csrf-cookie");

      // Step 2: Send Google token
      console.log("Sending Google token to backend...");
      const res = await ApiAuth.post("/google-auth", { token: googleToken });

      console.log("Backend response:", res.data);

      // Step 3: Handle successful login
      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        ApiAuth.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        updateGlobalAuthState();
        navigate("/loading");
      } else {
        throw new Error(res.data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Full Google auth error:", error);
      alert(
        "Erro ao fazer login com Google: " +
          (error.response?.data?.error || error.message)
      );
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
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">
          Login
        </h1>

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
            <img
              src={microsoftLogo}
              alt="Microsoft"
              className="w-8 h-8 ml-4 mr-2"
            />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

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
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
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
