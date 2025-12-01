import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";



export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); 
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ Get CSRF cookie
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include", // 🔥 required for Sanctum
    });

    // 2️⃣ POST to /register
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      credentials: "include", // 🔥 required for Sanctum
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle validation errors
      if (data.errors) {
        if (data.errors.email) {
          setEmailError(data.errors.email[0]);
        } else {
          setEmailError("");
        }

        const messages = Object.values(data.errors)
          .flat()
          .join("\n");
        alert(messages);
      } else {
        alert(data.message || "Erro no registro");
      }
      return;
    }

    // ✅ Success
    alert("Registro feito! Confirme seu e-mail para ativar sua conta.");
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setEmailError("");
    navigate("/");

  } catch (err) {
    console.error("Registration error:", err);
    alert(err.message);
  }
};


const handleGoogleRegister = async (response) => {
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

  const googleRegister = useGoogleLogin({
  onSuccess: handleGoogleRegister, 
  onError: handleGoogleError,
  flow: "implicit",
});

  // --- JSX ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-18">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Registrar</h1>

        {/* Social Registration Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleRegister()}
            className="w-full flex items-center justify-center bg-white border border-black text-gray-700 hover:border-black hover:bg-gray-100 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(""); // clear error while typing
              }}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            {emailError && <p className="text-red-500 text-sm ml-1 mt-1">Este e-mail já está em uso, tente outro.</p>}
          </div>

          {/* Password Input with Eye */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Password Confirmation Input with Eye - shows only if user typed a password */}
          {password.length > 0 && (
            <div className="relative">
              <input
                type={showPasswordConfirmation ? "text" : "password"}
                placeholder="Senha"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPasswordConfirmation ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95"
          >
            Registrar
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:text-red-600 font-medium transition-colors duration-200"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
