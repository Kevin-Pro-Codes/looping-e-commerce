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

  // Toggle function
  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
     {/* Top navbar */}
<div className="flex flex-col sm:flex-row justify-between items-center gap-1 px-2 sm:px-2 pt-2 pb-1">

  {/* Logo + Title */}
  <div className="flex items-center space-x-2 flex-shrink-0">
    <img 
      src={logo} 
      alt="Logo" 
      className="h-10 w-auto sm:h-10 p-0 align-middle block" 
    />
    <span
      className="font-bold text-3xl sm:text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap truncate"
      style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black" }}
    >
      Loop Shop
    </span>
  </div>

  {/* Flag + Search + Icons */}
  <div className="flex w-full sm:w-auto items-center gap-2 min-w-0 mt-2 sm:mt-0">

    {/* Flag */}
    <img 
      src={currentFlag} 
      alt={language === "en" ? "English" : "Português"} 
      className="h-6 w-6 sm:h-8 sm:w-8 object-cover cursor-pointer"
      onClick={toggleLanguage}
    />

    {/* Search box */}
    <div className="relative flex-1 min-w-[100px] max-w-[300px] sm:max-w-[600px]">
      <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-sm sm:text-lg" />
      <input
        type="text"
        placeholder="Procurar..."
        className="w-full border border-black rounded-md py-1 sm:py-2 pl-7 sm:pl-8 pr-2 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-sm sm:text-base"
      />
    </div>

    {/* Cart + Profile */}
    <div className="flex-shrink-0 flex items-center gap-1 sm:gap-3">
      <button className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100">
        <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
          5
        </span>
      </button>

      <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100">
        <FiUser className="text-2xl sm:text-3xl text-black" />
      </button>
    </div>
  </div>
</div>

      
 

 {/* Second navbar: Hamburger */} 
<div
  className="w-full flex justify-start pl-4 sm:pl-3 py-1 border-t-4 shadow-inner bg-black"
>
  {/* Hamburger button */}
 <button
  className="p-0 m-0 flex items-center justify-center rounded-none group ml-1"
  onClick={() => setMenuOpen(true)}
>
  <FiMenu
    className="text-white text-4xl leading-none transition-colors duration-300 group-hover:text-yellow-400"
  />
</button>

</div>

      </nav>

     {/* Left-side menu drawer */}
{menuOpen && (
  <div className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 border-4 border-white rounded-xl w-5/5 sm:w-5/5 md:w-5/5 lg:w-1/4">
    {/* Header: Menu title + Close button */}
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="font-bold text-3xl sm:text-5xl tracking-wide leading-tight whitespace-nowrap"
          style={{ fontFamily: "Calibri, sans-serif", color: "black" }}>
        Categorias
      </h2>

      {/* Close button */}
      <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full">
        <div style={{ position: "relative", width: "2.3rem", height: "2.3rem" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: "100%", height: "0.3rem", backgroundColor: "red",
            borderRadius: "9999px", transform: "translate(-50%, -50%) rotate(45deg)",
            border: "1px solid black"
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: "100%", height: "0.3rem", backgroundColor: "red",
            borderRadius: "9999px", transform: "translate(-50%, -50%) rotate(-45deg)",
            border: "1px solid black"
          }} />
        </div>
      </button>
    </div>

    {/* Category list */}
    <ul className="p-3 space-y-3 overflow-y-auto h-full">
      {categories.map((cat, index) => (
        <li key={index} className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
            style={{ fontFamily: "Calibri, sans-serif" }}>
          {cat}
        </li>
      ))}
    </ul>
  </div>
)}

    </>
  );
};

export default Navbar;
