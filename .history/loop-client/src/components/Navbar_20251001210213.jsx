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
  const [language, setLanguage] = useState("en");

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
              className="h-16 w-auto sm:h-18 p-1" // Reduced logo size
            />
            <span
              className="font-bold text-3xl sm:text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black" }}
            >
              Loop Shop
            </span>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2 min-w-0">
            <div className="flex flex-wrap sm:flex-nowrap w-full items-center gap-2 min-w-0">
              {/* Flag - Reduced size */}
              <img 
                src={currentFlag} 
                alt={language === "en" ? "English" : "Português"} 
                className="h-6 w-6 sm:h-7 sm:w-7 object-cover cursor-pointer" // Reduced flag size
                onClick={toggleLanguage}
              />

              {/* Search box - Reduced padding */}
              <div className="relative flex-1 min-w-[100px] max-w-[500px]">
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-base sm:text-lg" />
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-1 sm:py-2 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-sm sm:text-base" // Reduced padding and text size
                />
              </div>

              {/* Cart + Profile - Reduced sizes */}
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                <button className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" /> {/* Reduced icon size */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    5
                  </span>
                </button>

                <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100">
                  <FiUser className="text-2xl sm:text-3xl text-black" /> {/* Reduced icon size */}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second navbar - Reduced height and padding */}
        <div
          className="w-full flex justify-start px-2 py-1 border-t-2 shadow-inner" // Reduced padding and border
          style={{ backgroundColor: "#2C2C2C" }}
        >
          <button 
            className="p-2 flex items-center justify-center rounded-full" // Reduced padding
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="text-3xl text-white" /> {/* Reduced icon size */}
          </button>
        </div>
      </nav>

      {/* Left-side menu drawer - You can also reduce this if needed */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 border-2 border-black rounded-xl ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: Menu title + Close button */}
        <div className="flex justify-between items-center p-3 border-b"> {/* Reduced padding */}
          <h2
            className="font-bold text-2xl sm:text-3xl tracking-wide leading-tight whitespace-nowrap" // Reduced text size
            style={{
              fontFamily: "Calibri, sans-serif",
              color: "black",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            Categorias
          </h2>

          <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full">
            <div
              style={{
                position: "relative",
                width: "1.8rem", // Reduced size
                height: "1.8rem", // Reduced size
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "0.25rem", // Reduced thickness
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
                  height: "0.25rem", // Reduced thickness
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
        <ul className="p-3 space-y-1 overflow-y-auto h-full"> {/* Reduced padding and spacing */}
          {categories.map((cat, index) => (
            <li
              key={index}
              className="p-2 rounded cursor-pointer text-black text-lg md:text-xl" // Reduced text size
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