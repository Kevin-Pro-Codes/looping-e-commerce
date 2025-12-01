import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import gmailLogo from "../assets/gmail.png";
import microsoftLogo from "../assets/microsoft.png";
import yahooLogo from "../assets/yahoo.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); 
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  // ✅ ADD LOADING STATE FOR THE SUBMIT BUTTON
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ ADD STATES FOR RESEND FUNCTIONALITY
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  // ✅ ADD STATE FOR RESEND EMAIL MODAL
  const [showResendEmailModal, setShowResendEmailModal] = useState(false);
  const [resendEmailInput, setResendEmailInput] = useState("");

  const navigate = useNavigate();

  // ✅ COUNTDOWN TIMER FOR RESEND COOLDOWN
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const updateGlobalAuthState = () => {
    // Update localStorage
    localStorage.setItem("loggedIn", "true");
    
    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event("loginStateChange"));
    
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent("storage", {
      key: "loggedIn",
      newValue: "true"
    }));
  };

  // Helper: reads cookies from browser
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // ✅ RESEND VERIFICATION EMAIL FUNCTION (FOR MODAL)
  const handleResendVerification = async () => {
    if (!pendingEmail || countdown > 0) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      // 1. Get CSRF token
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = getCookie("XSRF-TOKEN");

      if (!csrfToken) throw new Error("CSRF token not found");

      // 2. Send resend request to backend
      const res = await fetch("http://localhost:8000/api/email/verification-resend", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage("✅ Email de verificação reenviado! Verifique sua caixa de entrada.");
        setCountdown(60); // 1 minute cooldown
      } else {
        setResendMessage(`❌ ${data.message || "Erro ao reenviar email"}`);
        
        // Set cooldown for rate limit errors
        if (res.status === 429) {
          setCountdown(300); // 5 minutes cooldown
        }
      }
    } catch (err) {
      console.error("Resend error:", err);
      setResendMessage("❌ Erro de conexão. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  // ✅ RESEND VERIFICATION EMAIL FUNCTION (FOR STANDALONE MODAL)
  const handleResendEmailVerification = async (e) => {
    if (e) e.preventDefault();
    
    if (!resendEmailInput) {
      alert("Por favor, insira seu email para reenviar a verificação.");
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      // 1. Get CSRF token
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = getCookie("XSRF-TOKEN");

      if (!csrfToken) throw new Error("CSRF token not found");

      // 2. Send resend request to backend
      const res = await fetch("http://localhost:8000/api/email/verification-resend", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify({ email: resendEmailInput }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage("✅ Email de verificação reenviado! Verifique sua caixa de entrada.");
        setCountdown(60); // 1 minute cooldown
        setResendEmailInput("");
        
        // Auto-close after success
        setTimeout(() => {
          setShowResendEmailModal(false);
          setResendMessage("");
        }, 3000);
      } else {
        setResendMessage(`❌ ${data.message || "Erro ao reenviar email"}`);
        
        // Set cooldown for rate limit errors
        if (res.status === 429) {
          setCountdown(300); // 5 minutes cooldown
        }
      }
    } catch (err) {
      console.error("Resend error:", err);
      setResendMessage("❌ Erro de conexão. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ SET LOADING STATE WHEN SUBMITTING
    setIsLoading(true);

    try {
      // 1️⃣ Get CSRF cookie from Sanctum
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include", // required for Sanctum
      });

      // 2️⃣ Extract XSRF Token from cookie
      const xsrfToken = getCookie("XSRF-TOKEN");

      // 3️⃣ POST to /register with X-XSRF-TOKEN header
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(xsrfToken), // 🔥 FIXES THE 419
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          if (data.errors.email) {
            setEmailError(data.errors.email[0]);
          } else {
            setEmailError("");
          }

          const messages = Object.values(data.errors)
            .flat()
            .join("\n");
          alert(messages);
        } else {
          alert(data.message || "Erro no registro");
        }
        return;
      }

      // ✅ SUCCESS - SHOW VERIFICATION MODAL INSTEAD OF REDIRECTING
      setPendingEmail(email);
      setShowVerificationModal(true);
      
      // Clear form but keep email for resend functionality
      setName("");
      setPassword("");
      setPasswordConfirmation("");
      setEmailError("");

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message);
    } finally {
      // ✅ RESET LOADING STATE WHEN FINISHED (SUCCESS OR ERROR)
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async (response) => {
    try {
      console.log("Google response:", response);
      const googleToken = response.access_token;
      if (!googleToken) throw new Error("Google access token not found");

      // 1️⃣ Get CSRF cookie (required by Sanctum)
      console.log("Getting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include", // include cookies
      });

      // 2️⃣ Extract CSRF token from document.cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send Google token to backend
      console.log("Sending Google token to backend...");
      const res = await fetch("http://localhost:8000/google-auth", {
        method: "POST",
        credentials: "include", // keep Sanctum cookies
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

  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleRegister, 
    onError: handleGoogleError,
    flow: "implicit",
  });

  // --- JSX ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-45" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl text-black font-bold mb-6 text-center">Registrar</h1>

        {/* Social Registration Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => googleRegister()}
            className="w-full flex items-center justify-center bg-white border border-black text-gray-700 hover:border-black hover:bg-gray-100 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <img src={gmailLogo} alt="Google" className="w-6 h-6 mr-3" />
            <span className="font-medium">Continuar com Google</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-1 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
            <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 ml-4 mr-2" />
            <span className="font-medium">Continuar com Microsoft</span>
          </button>

          <button className="w-full flex items-center justify-center bg-white border hover:border-black hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
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
                setEmailError(""); // clear error while typing
              }}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
            {emailError && <p className="text-red-500 text-sm ml-1 mt-1">Este e-mail já está em uso, tente outro.</p>}
          </div>

          {/* Password Input with Eye */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Password Confirmation Input with Eye - shows only if user typed a password */}
          {password.length > 0 && (
            <div className="relative">
              <input
                type={showPasswordConfirmation ? "text" : "password"}
                placeholder="Confirmar Senha"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPasswordConfirmation ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          )}

          {/* ✅ UPDATED SUBMIT BUTTON WITH GREY LOADING ANIMATION */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            } text-white py-3 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md`}
          >
            {isLoading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        {/* ✅ UPDATED: LOGIN AND RESEND ON SAME LINE */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:text-red-600 font-medium transition-colors duration-200"
            >
              logar
            </button>
            {" "}ou reenvie um{" "}
            <button
              onClick={() => setShowResendEmailModal(true)}
              className="text-blue-500 hover:text-red-600 font-medium transition-colors duration-200"
            >
              e-mail 
            </button>
            {" "}de confirmação
          </p>
        </div>
      </div>

      {/* ✅ VERIFICATION MODAL WITH VISIBLE BLUE RESEND LINK */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Verifique seu Email</h3>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Verificação Enviada!</h4>
              </div>

              <p className="text-gray-600 mb-4 text-center">
                Enviamos um link de verificação para: <br />
                <strong className="text-gray-800">{pendingEmail}</strong>
              </p>

              <p className="text-gray-600 mb-6 text-center text-sm">
                Clique no link no email para ativar sua conta. Se não encontrar o email, verifique sua pasta de spam.
              </p>

              {/* ✅ VISIBLE BLUE RESEND LINK */}
              <div className="text-center mb-4">
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading || countdown > 0}
                  className={`text-blue-500 hover:text-blue-700 font-medium underline transition-colors duration-200 ${
                    resendLoading || countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {resendLoading ? 'Enviando...' : 
                   countdown > 0 ? `Reenviar email em ${countdown}s` : 
                   'Reenviar email de verificação'}
                </button>
              </div>

              {resendMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                  resendMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setResendMessage("");
                    setCountdown(0);
                    navigate("/login");
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Ir para Login
                </button>

                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setResendMessage("");
                    setCountdown(0);
                  }}
                  className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESEND EMAIL MODAL */}
      {showResendEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Reenviar Email de Verificação</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Digite seu email abaixo para reenviar o link de verificação.
              </p>

              <form onSubmit={handleResendEmailVerification}>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={resendEmailInput}
                    onChange={(e) => setResendEmailInput(e.target.value)}
                    className="w-full text-gray-900 border border-gray-300 p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {resendMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                    resendMessage.includes('✅') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {resendMessage}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResendEmailModal(false);
                      setResendMessage("");
                      setResendEmailInput("");
                      setCountdown(0);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    disabled={resendLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resendLoading || countdown > 0}
                    className={`px-4 py-2 rounded text-white ${
                      resendLoading || countdown > 0
                        ? 'bg-gray-400' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {resendLoading ? 'Enviando...' : 
                     countdown > 0 ? `Aguarde ${countdown}s` : 
                     'Reenviar'}
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