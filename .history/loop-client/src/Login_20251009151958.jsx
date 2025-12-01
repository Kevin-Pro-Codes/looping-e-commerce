React 

import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";
import axios from "axios";

export default function Logar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  // Handle standard email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      alert("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email });

      // Step 1: Get CSRF cookie first
      await axios.get("/sanctum/csrf-cookie");

      // Step 2: Login request
      const res = await axios.post("/login", { 
        email, 
        password 
      });

      console.log("Login response:", res.data);

      // Store user info and token
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      if (res.data.token) {
        localStorage.setItem("auth_token", res.data.token);
        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = Bearer ${res.data.token};
      }

      alert(res.data.message || "Login successful!");
      navigate("/perfil");

    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.statusText;

        switch (status) {
          case 401:
            alert("Invalid email or password");
            break;
          case 419:
            alert("Session expired. Please refresh the page and try again.");
            window.location.reload(); // Force refresh to get new CSRF token
            break;
          case 422:
            const errors = err.response.data.errors;
            if (errors) {
              const errorMessages = Object.values(errors).flat().join(", ");
              alert("Validation error: " + errorMessages);
            } else {
              alert("Validation error: " + message);
            }
            break;
          case 429:
            alert("Too many login attempts. Please try again later.");
            break;
          case 500:
            alert("Server error. Please try again later.");
            break;
          default:
            alert(Error: ${message});
        }
      } else if (err.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component code remains the same

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

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}