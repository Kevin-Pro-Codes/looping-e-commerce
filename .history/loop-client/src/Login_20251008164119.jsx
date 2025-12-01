import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

axios.defaults.baseURL = "http://localhost:8000"; // Laravel API base
axios.defaults.withCredentials = true; // Optional, useful for cookies if needed

export default function Logar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Login via API token
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", { email, password });

      // Store Sanctum token in localStorage
      localStorage.setItem("login_token", res.data.login_token);

      alert(res.data.message);
      navigate("/perfil"); // redirect to profile
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Fetch authenticated user example
  const fetchUser = async () => {
    const token = localStorage.getItem("login_token");
    if (!token) return;

    try {
      const res = await axios.get("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Authenticated user:", res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Google OAuth login
  const handleGoogleSuccess = async (response) => {
    try {
      const token = response.access_token;
      if (!token) throw new Error("Google access token not found");

      const res = await axios.get("/test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response from /test:", res.data);
      navigate("/perfil");
    } catch (err) {
      console.error("Error with Google login:", err);
      alert(err.message);
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "implicit",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">
          Login
        </h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:shadow-md"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span>Continue with Google</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span>Continue with Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:shadow-md">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span>Continue with Yahoo</span>
          </button>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 shadow-sm hover:shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
