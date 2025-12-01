import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch, FiSettings, FiLogOut } from "react-icons/fi";
import { IoMdLogIn } from "react-icons/io";
import logo from '../assets/finito.png';
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";
import { useNavigate } from "react-router-dom";

const categories = [
  "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Feminino", "Literatura", "Psicodélico", "Yoga", "Espiritualidade", "Astrologia", "Aleatório"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Authentication state
  const [user, setUser] = useState(null); // User data
  const profileRef = useRef();

  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      // Replace with your actual authentication check
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  // Login function (you'll call this after successful login)
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    // Store in localStorage or context as needed
    localStorage.setItem('authToken', 'your-token-here');
    localStorage.setItem('userData', JSON.stringify(userData));
    setProfileOpen(false);
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setProfileOpen(false);
    navigate("/"); // Redirect to home after logout
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  // Profile popup content for logged-in users
  const renderLoggedInProfile = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-3 space-x-2">
        <FiUser className="text-xl sm:text-2xl text-black" />
        <span className="text-lg sm:text-xl font-bold text-black">Minha Conta</span>
      </div>

      {/* User info */}
      <div className="text-center mb-3 p-2 bg-gray-50 rounded">
        <p className="font-semibold text-black">{user?.name || "Usuário"}</p>
        <p className="text-sm text-gray-600">{user?.email || "user@example.com"}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            navigate("/perfil");
            setProfileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
        >
          <FiUser className="text-lg" />
          Meu Perfil
        </button>

        <button
          onClick={() => {
            navigate("/pedidos");
            setProfileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
        >
          <FiShoppingCart className="text-lg" />
          Meus Pedidos
        </button>

        <button
          onClick={() => {
            navigate("/configuracoes");
            setProfileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
        >
          <FiSettings className="text-lg" />
          Configurações
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
        >
          <FiLogOut className="text-lg" />
          Sair
        </button>
      </div>
    </div>
  );

  // Profile popup content for logged-out users
  const renderLoggedOutProfile = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl sm:text-2xl text-black" />
        <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
      </div>

      <button
        onClick={() => {
          navigate("/logar");
          setProfileOpen(false);
        }}
        className="w-full bg-red-500 text-white py-2 mb-2 rounded-md hover:bg-red-600 transition"
      >
        Logar
      </button>

      <button
        onClick={() => {
          navigate("/registrar");
          setProfileOpen(false);
        }}
        className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
      >
        Registrar
      </button>

      <p className="text-sm sm:text-sm text-center leading-tight ml-1 mr-3 mt-3 whitespace-nowrap" style={{ color: "black" }}>
        Já possui um cadastro? <span className="text-blue-500">Faça o login</span>
      </p>
    </div>
  );

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 pb-2 ml-1">
          {/* Logo + Title */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
          >
            {/* Your existing SVG logos */}
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto sm:h-17">
              {/* Your SVG path */}
            </svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-14">
              {/* Your SVG path */}
            </svg>
          </div>

          {/* Flag + Search + Icons */}
          <div className="flex flex-col sm:flex-row sm:ml-5 ml-4 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Flag */}
              <img 
                src={currentFlag} 
                alt={language === "en" ? "English" : "Português"} 
                className="h-10 w-10 sm:h-9 sm:w-9 object-cover cursor-pointer"
                onClick={toggleLanguage}
              />

              {/* Search box */}
              <div className="relative flex-1 min-w-[150px] max-w-[350px] sm:max-w-[500px] w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" /> 
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-2 sm:py-3 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
                />
              </div>

              {/* Cart + Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0 relative">
                {/* Cart */}
                <button className="relative p-2 sm:p-3 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    5
                  </span>
                </button>

                {/* Main Navbar Profile Icon */}
                <button
                  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100"
                  onClick={() => setProfileOpen(prev => !prev)}
                >
                  <FiUser className="text-2xl sm:text-3xl text-black" /> 
                </button>

                {/* Profile Popup - Conditionally rendered */}
                {profileOpen && (
                  isLoggedIn ? renderLoggedInProfile() : renderLoggedOutProfile()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Second navbar: Hamburger + items */}
        <div className="w-full flex items-center pl-0 pr-4 sm:pl-1 sm:pr-6 py-1 border-t-1 shadow-inner bg-black">
          {/* Hamburger button */}
          <button
            className="p-0 m-0 flex items-center justify-center rounded-full group"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="text-white text-3xl sm:text-4xl md:text-5xl pl-1 leading-none transition-colors duration-300 group-hover:text-yellow-400" />
          </button>

          {/* Horizontal items */}
          <div className="ml-4 hidden sm:flex flex-wrap gap-4 overflow-x-auto items-center justify-center whitespace-nowrap">
            {["CAMISETAS","REGATAS","BLUSAS","SHORTS","FEMININAS","BONÉS","CHINELOS", "TAPETES", "CANECAS", "INGRESSOS"].map((item, idx) => (
              <span
                key={idx}
                className="text-white text-sm sm:text-base md:text-lg mr-5 ml-2 hover:text-yellow-400 cursor-pointer font-sans"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* Left-side menu drawer */}
      {menuOpen && (
        <div className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5">
          {/* Drawer Profile / Login */}
          <div
            className="flex items-center gap-3 mb-6 cursor-pointer"
            onClick={() => setProfileOpen(prev => !prev)}
            style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
          >
            <FiUser className="text-3xl text-black" />
            <span className="text-2xl sm:text-lg leading-tight ml-1 mr-3 whitespace-nowrap">
              {isLoggedIn ? "Minha Conta" : "Logar ou Cadastrar"}
            </span>
          </div>

          {/* Show the appropriate popup in drawer */}
          {profileOpen && (
            <div className="mb-4">
              {isLoggedIn ? renderLoggedInProfile() : renderLoggedOutProfile()}
            </div>
          )}

          {/* Rest of your drawer content */}
          <div className="flex justify-between items-center flex-shrink-0 mb-4">
            <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
              Categorias
            </h2>
            <button onClick={() => setMenuOpen(false)} className="absolute top-11 right-3">
              {/* Your close button */}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto drawer-scroll">
            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li key={index} className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl">
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;