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
    const token = localStorage.getItem("token");
    const storedStatus = localStorage.getItem("loggedIn");
    setLoggedIn(token !== null || storedStatus === "true");

    const handleStorageChange = (e) => {
      if (e.key === "loggedIn") {
        setLoggedIn(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const handleRegister = () => {
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false);
  };
  
  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("token");
    setProfileOpen(false);
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
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Sair
          </button>
        </>
      )  : (    
        <>
          {/* FIXED: Removed handleLogin() and just navigate to login page */}
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => { 
              setProfileOpen(false); 
              navigate("/logar"); 
            }}
          >
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              setProfileOpen(false);
              navigate("/registrar");
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
            onClick={() => {
              localStorage.setItem("loggedIn", "false");
              setLoggedIn(false); 
              navigate("/");
            }}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer ml-1"
          >
            {/* Your SVG logos here */}
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 sm:h-13 md:h-14 lg:h-15 xl:h-16">
              <path d="M 406.617 913.539 ... " fill="black" stroke="black" strokeWidth="5" />
            </svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14">
              <path d="M 367.981 139.25 ... " fill="white" stroke="black" strokeWidth="7" />
            </svg>
          </div>

          {/* Flag + Search + Icons */}
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
                <button className="relative p-1 sm:p-1 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    5
                  </span>
                </button>

                <button
                  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setProfileOpen(prev => !prev)}
                >
                  <FiUser className="text-2xl sm:text-3xl text-black" />
                  {loggedIn && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {profileOpen && <ProfilePopup />}
              </div>
            </div>
          </div>
        </div>

        {/* Second navbar: Hamburger + items */}
        <div className="w-full flex items-center bg-white">
          <button
            className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300 absolute top-1 right-3 sm:static sm:mr-1 ml-3"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="text-black text-2xl sm:text-3xl" />
          </button>

          {/* Categories */}
          <div className="hidden sm:flex flex-1 justify-center items-center space-x-3 overflow-x-auto py-2">
            {categories.map(category => (
              <button
                key={category}
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 transition whitespace-nowrap text-black"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
