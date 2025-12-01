import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "./assets/gmail.png";
import microsoftLogo from "./assets/microsoft.png";
import yahooLogo from "./assets/yahoo.png";
import axios from "axios";

export default function Registrar() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Error state
  const navigate = useNavigate();

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error before submit

    try {
      // Fetch CSRF cookie
      await axios.get("/sanctum/csrf-cookie");

      // Send registration POST request
      const res = await axios.post("/register", {
        name,
        email,
        password,
        password_confirmation: password,
      });

      alert("Confirme em seu e-mail para usar sua conta.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Registration error:", error);

      // If Laravel validation fails (422)
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;
        if (errors.email) {
          setErrorMessage(errors.email[0]); // Show first email error
        } else {
          setErrorMessage("Erro de validação. Verifique os campos.");
        }
      } else {
        setErrorMessage("Erro ao registrar usuário. Tente novamente.");
      }
    }
  };

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

      navigate("/perfil"); 
    } catch (error) {
      console.error("Google login error:", error);
      alert("Erro: " + error.message);
    }
  };

  const handleGoogleError = () => {
    alert("Erro ao fazer login com Google.");
  };

  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "implicit",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-24" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-18">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Registrar</h1>

        {/* Social Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button onClick={() => googleRegister()} className="w-full flex items-center justify-center bg-white border border-black text-gray-700 hover:border-black hover:bg-gray-100 py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(""); // Reset error when typing
              }}
              className={`w-full text-gray-900 border p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errorMessage ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {errorMessage && <p className="text-red-600 text-sm mt-1">{errorMessage}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button onClick={() => navigate("/login")} className="text-blue-500 hover:text-red-600 font-medium transition-colors duration-200">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
