import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import gmailLogo from "../../assets/gmail.png";
import microsoftLogo from "../../assets/microsoft.png";
import yahooLogo from "../../assets/yahoo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const navigate = useNavigate();

  const updateGlobalAuthState = () => {
    localStorage.setItem("loggedIn", "true");
    window.dispatchEvent(new Event("loginStateChange"));
    window.dispatchEvent(new StorageEvent("storage", {
      key: "loggedIn",
      newValue: "true"
    }));
  };

  // ✅ FORGOT PASSWORD FUNCTION
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      alert("Por favor, insira seu email para redefinir a senha.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");

    try {
      console.log("🔄 Iniciando processo de recuperação de senha...");

      // 1. Get CSRF token
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token não encontrado");

      // 2. Send forgot password request
      console.log("📧 Enviando solicitação de recuperação de senha...");
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail 
        }),
      });

      const data = await response.json();
      console.log("📦 Resposta da recuperação:", data);

      if (response.ok) {
        setForgotPasswordMessage("✅ Email de recuperação enviado! Verifique sua caixa de entrada.");
        setForgotPasswordEmail("");
        
        // Auto-close after success
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage("");
        }, 3000);
      } else {
        throw new Error(data.message || "Erro ao enviar email de recuperação");
      }

    } catch (err) {
      console.error("❌ Erro na recuperação de senha:", err);
      setForgotPasswordMessage(`❌ ${err.message || "Erro ao processar solicitação"}`);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔄 Step 1: Getting CSRF token...");
      
      // 1. Get CSRF token FIRST
      const csrfResponse = await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
      
      console.log("🔐 CSRF response status:", csrfResponse.status);

      // 2. Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      console.log("🔑 CSRF token found:", !!csrfToken);

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3. Send login request WITH session cookies
      console.log("🔄 Step 2: Sending login credentials...");
      const loginResponse = await fetch("/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ 
          email, 
          password,
          device_name: 'web_browser'
        }),
      });

      console.log("🔐 Login response status:", loginResponse.status);

      const data = await loginResponse.json();
      console.log("📦 Login response data:", data);

      if (!loginResponse.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 4. Verify the session is actually working
      console.log("🔄 Step 3: Verifying session...");
      const verifyResponse = await fetch("/api/user", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔐 Verify response status:", verifyResponse.status);

      if (verifyResponse.ok) {
        const userData = await verifyResponse.json();
        console.log("✅ Session verified, user data:", userData);
        data.user = userData;
      } else {
        console.warn("⚠️ Session verification failed");
      }

      // 5. Save authentication data
      console.log("💾 Saving auth data to localStorage...");
      
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("loginTimestamp", Date.now().toString());

      // 6. Determine user type and destination
      const isAdmin = data.is_admin || data.user?.is_admin || data.user?.type === 'admin';
      const destination = isAdmin ? "/loading" : "/loading";
      
      console.log("👤 User type:", isAdmin ? "ADMIN" : "REGULAR");
      console.log("🎯 Destination:", destination);

      if (isAdmin) {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }

      // 7. Update global auth state IMMEDIATELY
      console.log("🔄 Updating global auth state...");
      window.dispatchEvent(new Event("loginStateChange"));

      window.dispatchEvent(new StorageEvent('storage', {
        key: 'loggedIn',
        newValue: 'true',
        oldValue: null,
        url: window.location.href
      }));

      // 8. Navigate IMMEDIATELY
      console.log("🔄 Navigating to:", destination);
      navigate(destination, { 
        replace: true,
        state: {
          fromLogin: true,
          timestamp: Date.now()
        }
      });
  
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // Clear any partial authentication on error
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("isAdmin");
      
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      console.log("Google response:", response);
      const googleToken = response.access_token;
      if (!googleToken) throw new Error("Google access token not found");

      // 1️⃣ Get CSRF cookie (required by Sanctum)
      console.log("Getting CSRF cookie...");
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token from document.cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send Google token to backend
      console.log("Sending Google token to backend...");
      const res = await fetch("/google-auth", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Google authentication failed");
      }

      const data = await res.json();
      console.log("Backend response:", data);

      // 4️⃣ Handle successful login
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));

        // Update your global auth state
        updateGlobalAuthState();

        navigate("/loading");
      } else {
        throw new Error(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Full Google auth error:", error);
      alert("Erro ao fazer login com Google: " + error.message);
    }
  };

  const handleGoogleError = () => {
    console.log("Login com Google falhou");
    alert("Erro ao fazer login com Google.");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: handleGoogleError,
    flow: "implicit",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-45" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Login</h1>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg shadow-sm">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>
          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
            <img src={yahooLogo} alt="Yahoo" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Yahoo</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input with Eye */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* ✅ FORGOT PASSWORD LINK */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-500 hover:text-red-600 text-sm font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
            } text-white py-3 rounded-lg transition-all duration-200 font-medium shadow-sm`}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-blue-500 hover:text-red-600 font-medium"
            >
              Registrar-se
            </button>
          </p>
        </div>
      </div>

      {/* ✅ FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-500 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-white">Recuperar Senha</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Digite seu email abaixo e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {forgotPasswordMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    forgotPasswordMessage.includes('✅') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {forgotPasswordMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordMessage("");
                      setForgotPasswordEmail("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    disabled={forgotPasswordLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className={`px-4 py-2 rounded text-white ${
                      forgotPasswordLoading 
                        ? 'bg-gray-400' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {forgotPasswordLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}