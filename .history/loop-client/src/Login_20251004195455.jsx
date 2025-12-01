import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Logar() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate(); // hook do React Router para redirecionar

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, senha });
    alert("Login realizado!");
    setEmail("");
    setSenha("");
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google credential:", credentialResponse.credential);

    // Aqui você pode enviar para backend Laravel
    fetch("http://localhost:8000/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Token Laravel:", data.access_token);
        localStorage.setItem("token", data.access_token);

        // Redireciona para a página desejada
        navigate("/dashboard"); // <- troque "/dashboard" para a página de destino
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
          {/* Google Login Button */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition" style={{ fontFamily: "Calibri, sans-serif" }}>
    <img src={gmailLogo} alt="Google" className="w-5 h-5 mr-3" />
    Continuar com Google
</button>

{/* 

 <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition" style={{ fontFamily: "Calibri, sans-serif" }}>
    <img src={gmailLogo} alt="Google" className="w-5 h-5 mr-3" />
    Continuar com Google
</button>

*/}

          {/* Microsoft & Yahoo (não implementados ainda) */}
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
