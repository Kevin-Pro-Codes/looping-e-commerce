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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ nome, email, senha });
    alert("Done!");
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
         {/* Custom Google Button */}
                 <button 
                   onClick={() => googleLogin()}
                   className="w-full flex items-center justify-center bg-white border border-black text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                   style={{ fontFamily: "Calibri, sans-serif" }}
                 >
                   <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
                   <span className="font-medium">Continuar com Google</span>
                 </button>
       
                 {/* Microsoft Button */}
                 <button className="w-full flex items-center justify-center bg-white border border-black text-gray-700 py-1 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
                   <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
                   <span className="font-medium">Continuar com Microsoft</span>
                 </button>
       
                 {/* Yahoo Button */}
                 <button className="w-full flex items-center justify-center bg-white border border-black text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
                   <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
                   <span className="font-medium">Continuar com Yahoo</span>
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
