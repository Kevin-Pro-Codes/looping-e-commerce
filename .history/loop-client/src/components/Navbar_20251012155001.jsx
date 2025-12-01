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
  "Finito", "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Esportes", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Literatura", "Psicodélico", "Yoga", "Espiritualidade", "Astrologia", "Aleatório"
];

const products = [
  "Masculino", "Feminino", "Camisetas", "Regatas", "Blusas", "Shorts", "Toucas", 
  "Bonés", "Meias", "Chinelos", "Óculos", "Canecas", "Almofadas", "Tapetes", "Ingressos"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();
  const navigate = useNavigate();
  
  // Single source of truth for login state
  const [loggedIn, setLoggedIn] = useState(() => {
    // Check both token and loggedIn status on initial load
    const token = localStorage.getItem("token");
    const storedStatus = localStorage.getItem("loggedIn");
    return token !== null || storedStatus === "true";
  });

  // Handle click outside profile popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Consolidated login state management
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const storedStatus = localStorage.getItem("loggedIn");
      const isLoggedIn = token !== null || storedStatus === "true";
      setLoggedIn(isLoggedIn);
    };

    // Check on component mount
    checkLoginStatus();

    // Listen for storage changes (other tabs) and custom login events
    const handleStorageChange = (e) => {
      if (e.key === "loggedIn" || e.key === "token") {
        checkLoginStatus();
      }
    };

    // Custom event for login state changes within the same tab
    const handleLoginStateChange = () => {
      checkLoginStatus();
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

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false);
    // Trigger custom event to sync all components
    window.dispatchEvent(new Event("loginStateChange"));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("token");
    setProfileOpen(false);
    // Trigger custom event to sync all components
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/");
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
              navigate("/perfil"); 
              setProfileOpen(false);
            }}
          >
            <FaUserCircle className="text-xl" />
            <span>Perfil</span>
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
              navigate("/logar");
              setProfileOpen(false);
            }}
          >
            <span>Entrar</span>
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
        </>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 py-1 sm:py-2 md:py-2 lg:py-2 xl:py-2 2xl:py-2">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Logo + Title */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer ml-1"
          >
            {/* Your SVG logos here */}
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 sm:h-13 md:h-14 lg:h-15 xl:h-16">
              {/* Your SVG path */}
            </svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14">
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
              <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0 relative">
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
                  <FiUser className="text-2xl sm:text-3xl text-black" />
                  {loggedIn && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Profile Popup */}
                {profileOpen && <ProfilePopup />}
              </div>
            </div>
          </div>
        </div>

        {/* Second navbar: Hamburger + items */}
        <div className="w-full flex items-center bg-white">
          {/* Hamburger button */}
          <button
            className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300
                       absolute top-1 right-3 sm:static sm:mr-1 ml-3"
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

            {/* 8-ball overlay */}
            <img
              src={eightBall}
              alt="8ball"
              className="hidden sm:block h-8 w-8 sm:h-8 sm:w-8 object-contain cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform"
            />
          </div>
        </div> 
      </nav>

      {/* Left-side menu drawer */}
      {menuOpen && (
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
              <FiUser className="text-3xl text-black" />
              {loggedIn && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
              )}
            </div>
            <span
              className="text-2xl sm:text-2xl leading-tight ml-3 mr-3 whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif" }}
            >
              {loggedIn ? "Logado" : "Logar ou Cadastrar"}
            </span>
          </div>

          {profileOpen && <ProfilePopup />}

          {/* Single scrollable container for headers + lists */}
          <div className="flex-1 overflow-y-auto drawer-scroll">
            {/* Categorias Header */}
            <div className="flex justify-between items-center flex-shrink-0 mb-4">
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
                Categorias
              </h2>
            </div>

            {/* Categorias list */}
            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
                >
                  {cat}
                </li>
              ))}
            </ul>

            {/* Produtos Header */}
            <div className="flex justify-between items-center flex-shrink-0 mb-4">
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap mt-1">
                Produtos
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-9 right-2 rounded-full hover:bg-transparent transition"
                style={{ fontFamily: "Calibri, sans-serif" }}
              >
                <div style={{ position: "relative", width: "2.3rem", height: "2.3rem" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: "100%",
                      height: "0.3rem",
                      backgroundColor: "red",
                      borderRadius: "9999px",
                      transform: "translate(-50%, -50%) rotate(45deg)",
                      border: "1px solid black",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: "100%",
                      height: "0.3rem",
                      backgroundColor: "red",
                      borderRadius: "9999px",
                      transform: "translate(-50%, -50%) rotate(-45deg)",
                      border: "1px solid black",
                    }}
                  />
                </div>
              </button>
            </div>

            {/* Produtos list */}
            <ul className="space-y-3 mb-6">
              {products.map((cat, index) => (
                <li
                  key={index}
                  className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
                >
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