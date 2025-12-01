import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Registrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ nome, email, senha });
    alert("!");
    setNome("");
    setEmail("");
    setSenha("");
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    console.log("Full Google response:", tokenResponse);

    const token = tokenResponse?.access_token;
    if (!token) {
      alert("No access token found in Google response!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/google/callback", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Network response was not ok');
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      localStorage.setItem("token", data.access_token);
      navigate("/t");
    } catch (error) {
      console.error("Error registering with Google:", error);
      alert("Erro ao registrar com Google.");
    }
  };

  // Called when Google login fails
  const handleGoogleError = (error) => {
    console.error("Google login failed:", error);
    alert("Erro ao registrar com Google.");
  };

  // Google OAuth hook
  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit', // or 'auth-code' if you want server-side exchange
  });


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-18">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">
          Registrar
        </h1>

        {/* Social Registration Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          
          {/* Custom Google Button */}
          <button 
            onClick={() => googleRegister()}
           className="w-full flex items-center justify-center bg-white border border-black text-gray-700 hover:border-black hover:bg-gray-100 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
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

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou cadastre com e-mail</span>
          </div>
        </div>

        {/* Standard Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              minLength="6"
            />
          </div>
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
              Fazer o login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}