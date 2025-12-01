import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
     <div className="flex flex-col sm:flex-row justify-between items-center w-full -gap-2 px-4 py-2">
  {/* Logo */}
  <div className="flex items-center space-x-2 mb-2 sm:mb-0 flex-shrink-0">
    <img src={logo} alt="Logo" className="h-16 w-16 sm:h-21 sm:w-21" />
    <span
      className="font-bold text-3xl sm:text-4xl tracking-wide leading-tight text-transparent break-words"
      style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.05em black" }}
    >
      Loop Shop
    </span>
  </div>

  {/* Search + Cart */}
  <div className="flex w-full sm:w-auto justify-between items-center gap-2 min-w-0">
    {/* Search Bar */}
    <input
      type="text"
      placeholder="Procurar..."
      className="flex-1 min-w-0 border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black"
    />

    {/* Cart */}
    <div className="flex-shrink-0 flex items-center">
      <button className="relative p-2 sm:p-3 rounded-md hover:bg-gray-100">
        <FiShoppingCart className="text-3xl sm:text-4xl text-black" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
          5
        </span>
      </button>
    </div>
  </div>
</div>

    </nav>
  );
};

export default Navbar;



{/*
</div>
<div className="flex flex-wrap justify-center items-center w-full gap-4 px-8">

  <div className="flex items-center space-x-2">
    <img src={logo} alt="Logo" className="h-21 w-21" />
    <span
      className="font-bold text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap"
      style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "2px black" }}
    >
      Loop Shop
    </span>
  </div>
*/}