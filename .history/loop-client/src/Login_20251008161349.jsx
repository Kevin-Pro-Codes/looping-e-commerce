import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // renamed from 'senha'
  const navigate = useNavigate();

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true; // required for Sanctum

  // Standard email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Get CSRF cookie
      await axios.get("/sanctum/csrf-cookie");

      // Step 2: POST login request
      const res = await axios.post("/login", { email, password });

      alert(res.data.message);
      localStorage.setItem("login_token", res.data.login_token); // store token
      navigate("/perfil");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  // Google social login
  const handleGoogleSuccess = async (response) => {
    try {
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
      console.error("Google login error:", error);
      alert("Error: " + error.message);
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    alert("Error logging in with Google.");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "implicit",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Login</h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continue with Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continue with Yahoo</span>
          </button>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
