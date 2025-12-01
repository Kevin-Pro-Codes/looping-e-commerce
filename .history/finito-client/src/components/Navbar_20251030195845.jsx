import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import logo from '../assets/finito.png';
import enFlag from "../assets/us.png";
import ptFlag from "../assets/br.png";
import eightBall from "../assets/8ball.png";
import { useNavigate } from "react-router-dom";

const categories = [
  "Finito", "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes & Séries", "Fitness", "Futebol", "Basquete", "Luta", "Motociclismo",
  "Tecnologia", "Profissões", "Países", "Engraçados", "Gênios", "Psicodélico", "Yoga & Espiritualidade", "Astrologia", "Aleatório"
];

const products = [
  "Masculino",
  "Feminino",
  "Camisetas",
  "Regatas",
  "Blusas",
  "Shorts",
  "Toucas",
  "Bonés",
  "Meias",
  "Chinelos",
  "Óculos",     
  "Canecas",
  "Almofadas",
  "Tapetes",
  "Ingressos"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isNavbarMinimized, setIsNavbarMinimized] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedStatus = localStorage.getItem("loggedIn");
      const user = localStorage.getItem("user");
      
      const isAuthenticated = (token !== null && token !== "null") || 
                             (storedStatus === "true") || 
                             (user && user !== "null" && user !== "{}");
      
      console.log("Navbar Auth check:", { token, storedStatus, user, isAuthenticated });
      setLoggedIn(isAuthenticated);
    };

    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === "loggedIn" || e.key === "token" || e.key === "user") {
        checkAuthStatus();
      }
    };

    const handleLoginStateChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginStateChange", handleLoginStateChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStateChange", handleLoginStateChange);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const handleRegister = () => {
    setProfileOpen(false);
  };
  
  const handleLogin = () => {
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loginTimestamp");
    
    window.dispatchEvent(new Event("loginStateChange"));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'loggedIn',
      newValue: 'false'
    }));
    
    setProfileOpen(false);
    navigate("/");
  };

  // Handle logo click for minimize/expand and navigation
  const handleLogoClick = (e) => {
    e.stopPropagation(); 
    
    // Toggle navbar minimized state
    setIsNavbarMinimized(prev => !prev);
    
    // Close profile popup and menu
    setProfileOpen(false);
    setMenuOpen(false);
    
    navigate("/", { 
      state: { 
        preserveAuth: true,
        timestamp: Date.now()
      }
    }); 
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  const ProfilePopup = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl sm:text-2xl text-black" />
        <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
      </div>
      {loggedIn ? (
        <>
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => {                     
              const isAdmin = localStorage.getItem("isAdmin") === "true";
              if (isAdmin) {
                navigate("/admin");
              } else {
                navigate("/profile");
              }
              setProfileOpen(false);
            }}
          >
            <FaUserCircle className="text-xl" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Sair
          </button>
        </>
      ) : (    
        <>
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => { 
              handleLogin(); 
              setProfileOpen(false); 
              navigate("/login");
            }}
          >
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              handleRegister();                               
              setProfileOpen(false);
              navigate("/register");
            }}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Registrar
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <nav className={`bg-white shadow-md fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isNavbarMinimized 
          ? 'h-16 py-2'  // Minimized height
          : 'py-1 sm:py-2'  // Normal height
      }`}>
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          
          {/* Logo + Title */}
          <div 
            onClick={handleLogoClick}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer ml-1 transition-all duration-300 hover:scale-105"
          >
            {/* Simple logo placeholder */}
            <div className={`bg-black text-white flex items-center justify-center font-bold rounded ${
              isNavbarMinimized ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'
            }`}>
              F
            </div>
            
            {/* Title */}
            <span className={`font-bold text-black transition-all duration-300 ${
              isNavbarMinimized ? 'text-lg' : 'text-xl sm:text-2xl'
            }`}>
              FINITO
            </span>
          </div>

          {/* Flag + Search + Icons - Hide when minimized */}
          {!isNavbarMinimized && (
            <div className="flex flex-col sm:flex-row ml-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                {/* Flag */}
                <img 
                  src={currentFlag} 
                  alt={language === "en" ? "English" : "Português"} 
                  className="h-7 w-11 sm:h-8 sm:w-10 object-contain cursor-pointer"
                  onClick={toggleLanguage}
                />

                {/* Search box */}
                <div className="relative flex-1 min-w-[150px] max-w-[350px] sm:max-w-[500px] w-full">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" />
                  <input
                    type="text"
                    placeholder="Procurar..."
                    className="w-full border border-black rounded-md py-1.5 sm:py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
                    style={{ fontFamily: "Calibri, Arial, sans-serif" }}
                  />
                </div>

                {/* Cart + Profile */}
                <div className="flex items-center space-x-2 sm:space-x-3 relative">
                  {/* Cart */}
                  <button className="relative p-1 sm:p-1 rounded-full hover:bg-gray-100">
                    <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                    <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                      5
                    </span>
                  </button>

                  {/* Main Navbar Profile Icon */}
                  <button
                    className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100 relative"
                    onClick={() => setProfileOpen(prev => !prev)}
                  >
                    {loggedIn ? (
                      <FiUser className={`text-2xl sm:text-3xl ${localStorage.getItem("isAdmin") === "true" ? "text-black" : "text-black"}`} />
                    ) : (
                      <FiUser className="text-2xl sm:text-3xl text-black" />
                    )}
                    {loggedIn && (
                      <span className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white ${localStorage.getItem("isAdmin") === "true" ? "bg-green-500" : "bg-green-500"}`}></span>
                    )}
                  </button>

                  {/* Profile Popup */}
                  {profileOpen && <ProfilePopup />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Second navbar: Hamburger + items - Hide when minimized */}
        {!isNavbarMinimized && (
          <div className="w-full flex items-center bg-white mt-2">
            {/* Hamburger button */}
            <button
              className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300
                         ml-3"
              onClick={() => setMenuOpen(true)}
            >
              <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
              <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
              <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
            </button>

            {/* Horizontal items (hidden on mobile) */}
            <div className="relative w-full">
              {/* Scrollable items */}
              <div className="hidden sm:flex ml-0 sm:ml-2 flex-nowrap gap-4 overflow-x-auto overflow-y-hidden items-center whitespace-nowrap pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] tracking-widest">
                {products.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-black text-sm sm:text-base md:text-lg px-2 hover:text-yellow-400 cursor-pointer font-bold"
                    style={{ fontFamily: "Calibri, sans-serif" }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* 8-ball overlay on the right (hidden on small screens) */}
              <img
                src={eightBall}
                alt="8ball"
                className="hidden sm:block h-8 w-8 sm:h-8 sm:w-8 object-contain cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Add padding to main content based on navbar state */}
      <div className={`transition-all duration-300 ${
        isNavbarMinimized ? 'pt-16' : 'pt-32 sm:pt-28'
      }`}>
        {/* Your page content will adjust automatically */}
      </div>

      {/* Left-side menu drawer with overlay */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Drawer */}
          <div
            className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5"
            style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
          >
            
            {/* Drawer Profile / Login */}
            <div
              className="flex items-center gap-3 mb-6 cursor-pointer"
              onClick={() => setProfileOpen(prev => !prev)}
            >
              <div className="relative">
                <FiUser className={`text-3xl ${localStorage.getItem("isAdmin") === "true" ? "text-black" : "text-black"}`} />
                {loggedIn && (
                  <span className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white ${localStorage.getItem("isAdmin") === "true" ? "bg-green-500" : "bg-green-500"}`}></span>
                )}
              </div>
              <span
                className="text-lg sm:text-lg leading-tight ml-3 mr-3 whitespace-nowrap"
                style={{ fontFamily: "Calibri, sans-serif" }}
              >
                {loggedIn ? (localStorage.getItem("isAdmin") === "true" ? "Admin Logado" : "Logado") : "Logar ou Cadastrar"}
              </span>
            </div>

            {profileOpen && (
              <div className="mb-6">
                <ProfilePopup />
              </div>
            )}

            {/* Single scrollable container for headers + lists */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Categorias Header */}
              <div className="flex justify-between items-center flex-shrink-0 mb-4">
                <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
                  Categorias
                </h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full hover:bg-gray-100 p-2 transition"
                >
                  <div className="w-6 h-6 relative">
                    <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border border-black" />
                    <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full border border-black" />
                  </div>
                </button>
              </div>

              {/* Categorias list */}
              <ul className="space-y-3">
                {categories.map((cat, index) => (
                  <li
                    key={index}
                    className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl hover:bg-gray-100 transition"
                  >
                    {cat}
                  </li>
                ))}
              </ul>

              {/* Produtos Header */}
              <div className="flex justify-between items-center flex-shrink-0 mb-4 mt-6">
                <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
                  Produtos
                </h2>
              </div>

              {/* Produtos list */}
              <ul className="space-y-3 mb-6">
                {products.map((cat, index) => (
                  <li
                    key={index}
                    className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl hover:bg-gray-100 transition"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;