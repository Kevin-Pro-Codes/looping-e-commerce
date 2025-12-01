import React, { useState } from "react";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";

export default function Registrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ nome, email, senha });
    alert("Cadastro realizado!");
    setNome("");
    setEmail("");
    setSenha("");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">
          Registro
        </h1>

        {/* Social Email Registration */}
        <div className="flex flex-col space-y-3 mb-6">
          {/* Google */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
            <img src={gmailLogo} alt="Google" className="w-5 h-5 mr-3" />
            Continuar com Google
          </button>

          {/* Microsoft */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
           <img src={microsoftLogo} alt="Microsoft" className="w-6 h-6 mr-0" />
            Continuar com Microsoft
          </button>

          {/* Yahoo */}
          <button className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
            <img src={yahooLogo} alt="Yahoo" className="w-5 h-5 mr-3" />
            Continuar com Yahoo
          </button>
        </div>

        {/* Standard Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full text-black border border-gray-300 p-3 rounded-md placeholder-gray-500"
            required
          />
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
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
