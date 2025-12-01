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
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50" style={{ outline: "1px solid red" }}>
        {/* Top navbar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center w-full gap-0.5 px-2 sm:px-4 py-0 sm:py-1"

          style={{ outline: "1px solid red" }}
        >
          {/* Logo + Title */}
          <div className="flex items-center space-x-3 -mb-2 sm:mb-0 flex-shrink-0 -ml-4" style={{ outline: "1px solid red" }}>
            <img src={logo} alt="Logo" className="h-20 w-25 sm:h-20 sm:w-25 p-2" style={{ outline: "1px solid red" }} />
            <span
              className="font-bold text-1xl sm:text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black", outline: "1px solid red" }}
            >
              Loop Shop
            </span>
          </div>

          {/* Right side (flag, search, cart, profile) */}
          <div className="flex w-full sm:w-auto items-center gap-3 min-w-0" style={{ outline: "1px solid red" }}>
            <div className="flex flex-wrap sm:flex-nowrap w-full items-center gap-2 min-w-0" style={{ outline: "1px solid red" }}>
              {/* Flag */}
              <img
                src={currentFlag}
                alt={language === "en" ? "English" : "Português"}
                className="h-8 w-8 sm:h-9 sm:w-9 object-cover cursor-pointer"
                onClick={toggleLanguage}
                style={{ outline: "1px solid red" }}
              />

              {/* Search box */}
              <div className="relative flex-1 min-w-[120px] max-w-[600px]" style={{ outline: "1px solid red" }}>
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" style={{ outline: "1px solid red" }} />
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-2 sm:py-3 pl-8 sm:pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
                  style={{ outline: "1px solid red" }}
                />
              </div>

              {/* Cart + Profile */}
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0" style={{ outline: "1px solid red" }}>
                <button className="relative p-2 sm:p-3 rounded-full hover:bg-gray-100" style={{ outline: "1px solid red" }}>
                  <FiShoppingCart className="text-3xl sm:text-4xl text-black" style={{ outline: "1px solid red" }} />
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center" style={{ outline: "1px solid red" }}>
                    5
                  </span>
                </button>

                <button className="p-2 sm:p-4 rounded-full hover:bg-gray-100" style={{ outline: "1px solid red" }}>
                  <FiUser className="text-3xl sm:text-4xl text-black" style={{ outline: "1px solid red" }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second navbar */}
        <div
          className="w-full flex justify-start px-0 sm:px-1 py-1 border-t-4 shadow-inner"
          style={{ backgroundColor: "#2C2C2C", outline: "1px solid red" }}
        >
          <button
            className="p-3 flex items-center justify-center rounded-full"
            onClick={() => setMenuOpen(true)}
            style={{ outline: "1px solid red" }}
          >
            <FiMenu className="text-5xl text-white" style={{ outline: "1px solid red" }} />
          </button>
        </div>
      </nav>

      {/* Left-side menu drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-105 bg-white shadow-xl z-50 transform transition-transform duration-300 border-4 border-black rounded-xl ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ outline: "1px solid red" }}
      >
        {/* Header: Menu title + Close button */}
        <div className="flex justify-between items-center p-4 border-b" style={{ outline: "1px solid red" }}>
          <h2
            className="font-bold text-3xl sm:text-5xl tracking-wide leading-tight whitespace-nowrap"
            style={{
              fontFamily: "Calibri, sans-serif",
              color: "black",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              outline: "1px solid red",
            }}
          >
            Categorias
          </h2>

          <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full" style={{ outline: "1px solid red" }}>
            <div style={{ position: "relative", width: "2.3rem", height: "2.3rem", outline: "1px solid red" }}>
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
                  outline: "1px solid red"
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
                  outline: "1px solid red"
                }}
              />
            </div>
          </button>
        </div>

        {/* Category list */}
        <ul className="p-4 space-y-2 overflow-y-auto h-full" style={{ outline: "1px solid red" }}>
          {categories.map((cat, index) => (
            <li
              key={index}
              className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
              style={{
                fontFamily: "Calibri, sans-serif",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                outline: "1px solid red",
              }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-opacity-30 z-40" onClick={() => setMenuOpen(false)} style={{ outline: "1px solid red" }}></div>
      )}
    </>
  );
};

export default Navbar;
