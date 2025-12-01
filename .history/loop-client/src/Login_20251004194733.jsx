import React, { useState } from "react";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Logar() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, senha });
    alert("Login realizado!");
    setEmail("");
    setSenha("");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center" style={{ fontFamily: "Calibri, sans-serif" }}>
          Login
        </h1>

        {/* Social Login Buttons */}
       <GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  useOneTap
  render={(renderProps) => (
    <button
      onClick={renderProps.onClick}
      disabled={renderProps.disabled}
      className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 text-white font-extrabold uppercase tracking-wider py-4 px-8 rounded-2xl shadow-2xl hover:scale-105 transition-transform transform relative overflow-hidden"
      style={{ fontFamily: "Verdana, sans-serif" }}
    >
      {/* Efeito de círculo animado */}
      <span className="absolute top-0 left-0 w-12 h-12 bg-white rounded-full opacity-20 animate-ping"></span>
      <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-4 z-10 relative" />
      <span className="z-10 relative">Entrar com Google</span>
    </button>
  )}
/>


          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition" style={{ fontFamily: "Calibri, sans-serif" }}>
            <img src={microsoftLogo} alt="Microsoft" className="w-7 h-7 ml-[1.1rem] mr-[0.675rem]" />
            Continuar com Microsoft
          </button>

          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition" style={{ fontFamily: "Calibri, sans-serif" }}>
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
            style={{ fontFamily: "Calibri, sans-serif" }}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full text-black border border-gray-300 p-3 rounded-md placeholder-gray-500"
            style={{ fontFamily: "Calibri, sans-serif" }}
            required
          />
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition"
            style={{ fontFamily: "Calibri, sans-serif" }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
