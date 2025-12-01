import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { IoMdLogIn } from "react-icons/io";
import logo from "../assets/finito.png";
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";
import { useNavigate } from "react-router-dom";

const categories = [
  "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Motociclismo",
  "Tecnologia", "Profissões", "Países", "Dinheiro", "Engraçados", "Feminino", "Literatura", 
  "Psicodélico", "Yoga", "Espiritualidade", "Astrologia", "Aleatório"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); 
  const [language, setLanguage] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // estado do login

  const profileRef = useRef();
  const navigate = useNavigate();

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
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  const handleLogin = () => {
    // Aqui pode integrar com seu backend ou Firebase
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 pb-2 ml-1">
          {/* LOGO */}
          <div onClick={() => navigate("/")} className="flex items-center space-x-2 cursor-pointer">
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto sm:h-17">
              <path d="M 406.617 913.539 ... " fill="black" stroke="black" strokeWidth="5"/>
            </svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-14">
              <path d="M 367.981 139.25 ... " fill="black"/>
            </svg>
          </div>

          {/* MENU PRINCIPAL */}
          <div className="flex items-center space-x-4 mr-4">
            {/* BOTÃO MENU */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden">
              <FiMenu size={24} />
            </button>

            {/* CAMPO PESQUISA */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1">
              <FiSearch className="text-gray-500 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent outline-none" />
            </div>

            {/* IDIOMA */}
            <img
              src={currentFlag}
              alt="language"
              className="w-6 h-6 cursor-pointer"
              onClick={toggleLanguage}
            />

            {/* LOGIN / PERFIL */}
            <div ref={profileRef} className="relative">
              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1 text-gray-700 hover:text-black"
                >
                  <IoMdLogIn size={22} />
                  <span>Faça o login</span>
                </button>
              ) : (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-black"
                >
                  <FiUser size={22} />
                </button>
              )}

              {/* POPUP PERFIL */}
              {profileOpen && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* CARRINHO */}
            <button onClick={() => navigate("/cart")}>
              <FiShoppingCart size={22} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
