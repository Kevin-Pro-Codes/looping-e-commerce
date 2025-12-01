import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Logar() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, senha });
    alert("Login realizado!");
    setEmail("");
    setSenha("");
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google credential:", credentialResponse.credential);

    fetch("http://localhost:8000/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Token Laravel:", data.access_token);
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard"); // Redireciona
      })
      .catch((err) => console.error(err));
  };

  const handleGoogleError = () => {
    console.log("Login com Google falhou");
    alert("Erro ao fazer login com Google.");
  };

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
          {/* Google Login Button Customizado */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                className="relative z-50 w-full flex items-center justify-center bg-black text-white font-extrabold uppercase tracking-wider py-4 px-8 rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transform transition-transform"
                style={{ fontFamily: "Courier New, monospace" }}
              >
                {/* Gradiente animado atrás */}
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 opacity-30 animate-pulse"></span>

                {/* Ícone giratório */}
                <img
                  src={gmailLogo}
                  alt="Google"
                  className="w-6 h-6 mr-4 z-10 relative animate-spin-slow"
                />

                {/* Texto */}
                <span className="z-10 relative">Entrar com Google</span>

                {/* Círculos animados extras */}
                <span className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-bounce"></span>
                <span className="absolute -bottom-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-150"></span>
              </button>
            )}
          />

          {/* Microsoft & Yahoo (apenas layout) */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
            <img src={microsoftLogo} alt="Microsoft" className="w-7 h-7 ml-[1.1rem] mr-[0.675rem]" />
            Continuar com Microsoft
          </button>

          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
            <img src={yahooLogo} alt="Yahoo" className="w-5 h-5 mr-3" />
            Continuar com Yahoo
          </button>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-black border border-gray-300 p-3 rounded-md placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full text-black border border-gray-300 p-3 rounded-md placeholder-gray-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
