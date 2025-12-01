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

  const updateGlobalAuthState = (userData, isAdmin) => {
    // Clear all previous auth data
    localStorage.clear();
    
    // Set new auth data
    localStorage.setItem("user", JSON.stringify(userData || {}));
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("loginTimestamp", Date.now().toString());
    
    if (isAdmin) {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.removeItem("isAdmin");
    }
    
    // Dispatch custom event with detailed information
    window.dispatchEvent(new CustomEvent("authStateChange", {
      detail: { 
        loggedIn: true, 
        user: userData,
        isAdmin: isAdmin 
      }
    }));
    
    // Also dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent("storage", {
      key: "loggedIn",
      newValue: "true"
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("🔄 Step 1: Clearing previous session...");
      
      // 1. Clear any existing session first
      await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      }).catch(err => console.log("No active session to clear"));

      // 2. Get fresh CSRF token
      console.log("🔄 Step 2: Getting CSRF token...");
      const csrfResponse = await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
      
      console.log("🔐 CSRF response status:", csrfResponse.status);

      // 3. Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      console.log("🔑 CSRF token found:", !!csrfToken);
      if (!csrfToken) throw new Error("CSRF token not found");

      // 4. Send login request WITH session cookies
      console.log("🔄 Step 3: Sending login credentials...");
      const loginResponse = await fetch("http://localhost:8000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ 
          email, 
          password,
          device_name: 'web_browser'
        }),
      });

      console.log("🔐 Login response status:", loginResponse.status);
      const data = await loginResponse.json();
      console.log("📦 Login response data:", data);

      if (!loginResponse.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 5. Verify the session is actually working
      console.log("🔄 Step 4: Verifying session...");
      const verifyResponse = await fetch("http://localhost:8000/api/user", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔐 Verify response status:", verifyResponse.status);

      if (verifyResponse.ok) {
        const userData = await verifyResponse.json();
        console.log("✅ Session verified, user data:", userData);
        
        // Use the verified user data instead of login response data
        data.user = userData;
      } else {
        throw new Error("Session verification failed");
      }

      // 6. Determine user type and update global state
      const isAdmin = data.is_admin || data.user?.is_admin || data.user?.type === 'admin';
      console.log("👤 User type:", isAdmin ? "ADMIN" : "REGULAR");

      // 7. Update global auth state with verified data
      updateGlobalAuthState(data.user, isAdmin);

      // 8. Navigate with proper state
      console.log("🔄 Navigating to loading...");
      setTimeout(() => {
        navigate("/loading", { 
          replace: true,
          state: {
            fromLogin: true,
            timestamp: Date.now(),
            userType: isAdmin ? 'admin' : 'user'
          }
        });
      }, 100);

    } catch (err) {
      console.error("❌ Login error:", err);
      
      // Clear any partial authentication on error
      localStorage.clear();
      
      alert(err.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      console.log("Google response:", response);
      const googleToken = response.access_token;
      if (!googleToken) throw new Error("Google access token not found");

      // Clear previous session
      await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      }).catch(err => console.log("No active session to clear"));

      // 1️⃣ Get CSRF cookie (required by Sanctum)
      console.log("Getting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
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
        credentials: "include",
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
      if (data.success) {
        const isAdmin = data.is_admin || data.user?.is_admin || data.user?.type === 'admin';
        updateGlobalAuthState(data.user, isAdmin);

        setTimeout(() => {
          navigate("/loading", { 
            replace: true,
            state: {
              fromLogin: true,
              timestamp: Date.now(),
              userType: isAdmin ? 'admin' : 'user'
            }
          });
        }, 100);
      } else {
        throw new Error(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Full Google auth error:", error);
      localStorage.clear();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-45" style={{ fontFamily: "Calibri, sans-serif" }}>
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
              onClick={() => navigate("/register")}
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