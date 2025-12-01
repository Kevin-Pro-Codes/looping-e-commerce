import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";

import logo from '../assets/logo.png';
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";

const categories = [
  "Rock and roll", "Luta", "Futebol", "Basquete", "Motociclismo",
  "Desenhos", "Super-heróis", "Profissões", "Tecnologia", "Países",
  "Dinheiro", "Engraçados", "Feminino", "Psicodélico", "Dinheiro",
  "Psicodélicos", "Yoga", "Espiritualidade", "Filmes", "Games", "Aleatório"
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
        {/* Top navbar - Reduced padding and spacing */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-1 px-4 sm:px-6 py-1 sm:py-1">
          {/* Logo + Title - Reduced sizes */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            
<img 
  src={logo} 
  alt="Logo" 
  className="h-16 w-auto sm:h-18 p-0 align-middle block" 
/>
            <span
              className="font-bold text-4xl sm:text-5xl tracking-wide leading-tight text-transparent whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black" }}
            >
              Loop Shop
            </span>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-3 min-w-0">
  <div className="flex flex-wrap sm:flex-nowrap w-full items-center gap-2 min-w-0">
  {/* Flag */}
  <img 
    src={currentFlag} 
    alt={language === "en" ? "English" : "Português"} 
    className="h-8 w-8 sm:h-9 sm:w-9 object-cover cursor-pointer"
    onClick={toggleLanguage}
  />

  {/* Search box */}
  <div className="relative flex-1 min-w-[120px] max-w-[600px]">
    <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" />
    <input
      type="text"
      placeholder="Procurar..."
      className="w-full border border-black rounded-md py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
    />
  </div>

  {/* Cart + Profile */}
  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0">
    <button className="relative p-2 sm:p-3 rounded-full hover:bg-gray-100">
      <FiShoppingCart className="text-3xl sm:text-4xl text-black" />
      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center">
        5
      </span>
    </button>

    <button className="p-2 sm:p-4 rounded-full hover:bg-gray-100">
      <FiUser className="text-3xl sm:text-4xl text-black" />
    </button>
  </div>
</div>

          </div>
        </div>

        {/* Second navbar: Hamburger */} 
       <div
  className="w-full flex justify-start px-0 sm:px-1 py-1 border-t-4  shadow-inner"
  style={{ backgroundColor: "#2C2C2C" }} // custom color
>

          <button 
            className="p-3 flex items-center justify-center rounded-full"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu style={{ fontSize: "4rem", lineHeight: 0 }} className="text-white" />
          </button>
        </div>
      </nav>

      {/* Left-side menu drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-105 bg-white shadow-xl z-50 transform transition-transform duration-300 border-4 border-black rounded-xl ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: Menu title + Close button */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2
            className="font-bold text-3xl sm:text-5xl tracking-wide leading-tight whitespace-nowrap"
            style={{
              fontFamily: "Calibri, sans-serif",
              color: "black",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            Categorias
          </h2>

          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 rounded-full"
          >
{/* Close button */}
<button onClick={() => setMenuOpen(false)} className="p-1 rounded-full">
  <div
    style={{
      position: "relative",
      width: "2.3rem",
      height: "2.3rem",
    }}
  >
    {/* First stroke */}
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
    {/* Second stroke */}
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





          </button>
        </div>

        {/* Category list */}
        <ul className="p-4 space-y-2 overflow-y-auto h-full">
          {categories.map((cat, index) => (
            <li
              key={index}
              className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl "
              style={{
                fontFamily: "Calibri, sans-serif",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 z-40"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
