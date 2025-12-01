import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";

import logo from '../assets/logo.png';
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";

const categories = [
  "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Feminino","Psicodélico", "Yoga", "Espiritualidade", "Aleatório"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // popup state
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();

  // Close popup when clicking outside
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

  const currentFlag = language === "en" ? enFlag : ptFlag;

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 pb-2">
          {/* Logo + Title */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <img src={logo} alt="Logo" className="h-10 w-auto sm:h-10 p-0 align-middle block" />
            <svg viewBox="0 0 350 100" xmlns="http://www.w3.org/2000/svg" className="w-auto h-14">
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Poppins', sans-serif"
                fontSize="48"
                fontWeight="800"
                fill="white"
                stroke="black"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                letterSpacing="0.2em"
              >
                Loop Shop
              </text>
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

                {/* Login/Register Pop-up */}
             {profileOpen && (
  <div
    ref={profileRef}
    className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
  >
      <div className="flex items-center justify-center mb-2 space-x-2">
                      <FiUser className="text-xl sm:text-2xl text-black" />
                      <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
                    </div>
    <button className="w-full bg-red-500 text-white py-2 mb-2 rounded-md hover:bg-red-600 transition">
      Logar
    </button>
    <button className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition">
      Cadastrar
    </button>
    <p className="text-xs text-center text-gray-500 mt-2">
      Já possui um cadastro? Faça o login
    </p>
  </div>
)}



              </div>
            </div>
          </div>
        </div>

        {/* Second navbar: Hamburger + items */}
        <div
          className="w-full flex items-center pl-0 pr-4 sm:pl-1 sm:pr-6 py-1 border-t-1 shadow-inner bg-black"
        >
          {/* Hamburger button - always visible */}
          <button
            className="p-0 m-0 flex items-center justify-center rounded-full group"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu
              className="text-white text-3xl sm:text-4xl md:text-5xl pl-1 leading-none transition-colors duration-300 group-hover:text-yellow-400"
            />
          </button>

          {/* Horizontal items - hidden on mobile, shown from sm */}
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
          >
            <FiUser className="text-3xl text-black" />
            <span
              className="text-2xl sm:text-2xl leading-tight ml-1 mr-3 whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
            >
              Logar ou Cadastrar
            </span>
          </div>

          {/* Show the same login/register popup below drawer profile */}
          {profileOpen && (
            <div className="bg-white shadow-lg rounded-lg border border-black p-4 mb-4 z-50">
                <div className="flex items-center justify-center mb-2 space-x-2">
                      <FiUser className="text-xl sm:text-2xl text-black" />
                      <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
                    </div>
              <button className="w-full bg-red-500 text-white py-2 mt-2 mb-2 rounded-md hover:bg-red-600 transition">
                Logar
              </button>
              <button className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition">
                Cadastrar
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Já possui um cadastro? Faça o login
              </p>
            </div>
          )}

          {/* Header: Menu title + Close button */}
          <div className="flex justify-between items-center flex-shrink-0 mb-4">
            <h2
              className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
            >
              Categorias
            </h2>

            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-11 right-3 rounded-full hover:bg-transparent transition"
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

          {/* Category list */}
          <div className="flex-1 overflow-y-auto drawer-scroll">
            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
                  style={{ fontFamily: "Calibri, sans-serif" }}
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
