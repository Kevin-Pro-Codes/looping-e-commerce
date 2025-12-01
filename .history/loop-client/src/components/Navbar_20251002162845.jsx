import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";

import logo from '../assets/logo.png';
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";

const categories = [
  "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Feminino", "Psicodélico", "Psicodélicos", "Yoga", "Espiritualidade", "Aleatório"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
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
      className="h-14 w-auto sm:h-16 p-0 align-middle block"
    />
    <span
      className="font-bold text-4xl sm:text-5xl tracking-wide leading-tight text-transparent whitespace-nowrap truncate"
      style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.05em black" }}
    >
      Loop Shop
    </span>
  </div>

  {/* Flag + Search + Icons */}
  <div className="flex flex-col sm:flex-row sm:ml-5 ml-4 mt-2 sm:mt-0 w-full sm:w-auto">
    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
      {/* Flag */}
      <img 
        src={currentFlag} 
        alt={language === "en" ? "English" : "Português"} 
        className="h-10 w-10 sm:h-12 sm:w-12 object-cover cursor-pointer"
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
      <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
        <button className="relative sm:p-3 rounded-full hover:bg-gray-100">
          <FiShoppingCart className="text-2xl sm:text-3xl text-black" /> 
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            5
          </span>
        </button>

        <button className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100">
          <FiUser className="text-2xl sm:text-3xl text-black" /> 
        </button>
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
    {["CAMISETAS","REGATAS","BLUSAS","SHORTS","FEMININAS","BONÉS","CHINELOS","CANECAS", "TAPETES", "INGRESSOS"].map((item, idx) => (
      <span
        key={idx}
        className="text-white text-sm sm:text-base md:text-lg mr-5 ml-4 hover:text-yellow-400 cursor-pointer font-sans"
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
  <div className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 border-4 border-white rounded-xl w-full sm:w-full md:w-full lg:w-1/4 flex flex-col">
    
    {/* Header: Menu title + Close button */}
    <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
      <h2
        className="font-bold text-3xl sm:text-5xl tracking-wide leading-tight whitespace-nowrap"
        style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
      >
        Categorias
      </h2>

      {/* Close button */}
      <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full">
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
    <div className="flex-1 overflow-y-auto">
      <ul className="p-3 space-y-3">
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
