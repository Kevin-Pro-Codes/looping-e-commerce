import React, { useState } from "react";
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
  const [profileOpen, setProfileOpen] = useState(false); // toggle for login/register box
  const [language, setLanguage] = useState("en"); // Track language

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
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-auto sm:h-10 p-0 align-middle block"
            />
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

                {/* Profile */}
                <button
                  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100"
                  onClick={() => setProfileOpen(prev => !prev)}
                >
                  <FiUser className="text-2xl sm:text-3xl text-black" /> 
                </button>

                {/* Login/Register Box */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-200 p-4 z-50">
                    <h3 className="text-lg font-bold mb-2">Bem-vindo!</h3>
                    <button className="w-full bg-red-500 text-white py-2 mb-2 rounded-md hover:bg-red-600 transition">
                      Logar
                    </button>
                    <button className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition">
                      Cadastrar
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Faça login ou registre-se para aproveitar todos os benefícios!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </nav>
    </>
  );
};

export default Navbar;
