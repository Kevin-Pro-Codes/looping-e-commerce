import React, { useState, useEffect } from "react";
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
  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:8000";
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Get CSRF cookie for Sanctum (if you're using it)
    axios.get('/sanctum/csrf-cookie', {
      withCredentials: true
    }).catch(err => console.log('CSRF cookie request failed:', err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting login with:", { email });
      
      const res = await axios.post("/api/login", {
        email,
        password,
      }, {
        withCredentials: true, // Important for cookies/sessions
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      console.log("Login successful:", res.data);

      // Store the returned token
      if (res.data.login_token) {
        localStorage.setItem("login_token", res.data.login_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.login_token}`;
      } else if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      }

      // Store user info
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      alert(res.data.message || "Login successful!");
      navigate("/perfil");

    } catch (err) {
      console.error("Login error details:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.statusText;
        
        switch (status) {
          case 401:
            alert("Invalid email or password");
            break;
          case 419:
            alert("CSRF token mismatch. Please check your Laravel CSRF configuration.");
            console.error("CSRF Error - Make sure 'api/login' is in VerifyCsrfToken exceptions");
            break;
          case 422:
            const validationErrors = err.response.data.errors;
            if (validationErrors) {
              alert("Validation errors: " + Object.values(validationErrors).flat().join(', '));
            } else {
              alert("Validation error: " + message);
            }
            break;
          default:
            alert(`Error ${status}: ${message}`);
        }
      } else if (err.request) {
        alert("Network error. Please check if Laravel server is running.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log("Google auth response:", response);

      const token = response.access_token;
      if (!token) throw new Error("Google access token not found");

      const res = await fetch("http://localhost:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response from /test:", data);
        
      navigate("/perfil"); 

    } catch (error) {
      console.error("Error sending token to /test:", error);
      alert("Error: " + error.message);
    }
  };

  const handleGoogleError = () => {
    console.log("Login com Google falhou");
    alert("Erro ao fazer login com Google.");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
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
          {/* Custom Google Button */}
          <button 
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ fontFamily: "Calibri, sans-serif" }}
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>

          {/* Microsoft Button */}
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          {/* Yahoo Button */}
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
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
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}