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

  // Callback do login tradicional
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, senha });
    alert("Login realizado!");
    setEmail("");
    setSenha("");
  };

  // Callback do Google OAuth
  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google token:", credentialResponse.credential);

    // Envia token para backend Laravel
    fetch("http://localhost:8000/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        return data;
      })
      .then((data) => {
        console.log("Token Laravel recebido:", data.access_token);
        localStorage.setItem("token", data.access_token);

        // Redireciona após login
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Erro ao processar login no servidor:", err.message);
        alert("Erro ao processar login no servidor.");
      });
  };

  const handleGoogleError = () => {
    alert("Erro ao fazer login com Google.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Login</h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          {/* Google Login */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                className="w-full flex items-center justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ fontFamily: "Calibri, sans-serif" }}
              >
                <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
                <span className="font-medium">Continuar com Google</span>
              </button>
            )}
          />

          {/* Microsoft */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          {/* Yahoo */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
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
          <button type="submit" className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
