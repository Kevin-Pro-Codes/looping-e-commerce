// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Check if token is valid on component mount
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!token || !email) {
        setTokenValid(false);
        return;
      }

      try {
        await fetch("http://localhost:8000/sanctum/csrf-cookie", {
          method: "GET",
          credentials: "include",
        });

        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];

        const response = await fetch("http://localhost:8000/check-reset-token", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();
        setTokenValid(response.ok && data.valid);
      } catch (error) {
        console.error("Token check error:", error);
        setTokenValid(false);
      }
    };

    checkTokenValidity();
  }, [token, email]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setMessage("❌ As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setMessage("❌ A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Get CSRF token
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const response = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Senha redefinida com sucesso! Redirecionando para login...");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error(data.message || 'Erro ao redefinir senha');
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Link Inválido</h2>
          <p className="text-gray-600 mb-4">
            Este link de redefinição é inválido ou expirou.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Redefinir Senha
        </h2>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              placeholder="Confirme sua nova senha"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || tokenValid === null}
            className={`w-full ${
              isLoading || tokenValid === null ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
            } text-white py-3 rounded-lg transition-all duration-200 font-medium shadow-sm`}
          >
            {isLoading ? 'Redefinindo...' : tokenValid === null ? 'Verificando...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
}