import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🛡️ Starting admin login...");

      // 1️⃣ Get CSRF cookie from Sanctum
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send login credentials with admin verification
      const res = await fetch("http://localhost:8000/login", {
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
          // Optional: Tell backend this is admin login attempt
          admin_login: true 
        }),
      });

      // 4️⃣ Parse response
      const data = await res.json();
      console.log("🔐 Admin login response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // 5️⃣ CRITICAL: Verify this is actually an admin user
      const isAdminUser = data.is_admin || data.user?.is_admin || data.user?.type === 'admin';
      
      if (!isAdminUser) {
        throw new Error("❌ Access denied. Administrator credentials required.");
      }

      console.log("✅ Admin verified, proceeding to admin panel...");

      // 6️⃣ Save admin data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // 7️⃣ Set admin authentication state
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      
      // Dispatch auth state change
      window.dispatchEvent(new Event("loginStateChange"));
      
      // 8️⃣ Navigate DIRECTLY to admin panel - no loading page!
      navigate("/admin", { 
        replace: true // Replace history so they can't go back to login
      });

    } catch (err) {
      console.error("❌ Admin login error:", err);
      alert(err.message || "Admin login failed");
      
      // Clear any partial authentication on error
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-700">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl text-white font-bold mb-2">Admin Access</h1>
          <p className="text-gray-400 text-sm">Restricted Area - Authorized Personnel Only</p>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Administrator Email
            </label>
            <input
              type="email"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 p-4 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 p-4 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying Admin Access...
              </div>
            ) : (
              "🔐 Access Admin Panel"
            )}
          </button>
        </form>

        {/* Regular User Redirect */}
        <div className="text-center mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Regular user account?
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:text-blue-300 font-medium mt-2 transition-colors"
            disabled={loading}
          >
            ← Go to User Login
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            🔒 This system is monitored. Unauthorized access attempts will be logged.
          </p>
        </div>
      </div>
    </div>
  );
}