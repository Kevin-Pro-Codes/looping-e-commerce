import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between w-full px-4 md:px-8 py-2 max-w-screen-4xl mx-auto">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-12 w-12 md:h-21 md:w-21" />
          <span
            className="font-bold text-2xl md:text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap"
            style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "2px black" }}
          >
            Loop Shop
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-4 min-w-[150px]">
          <input
            type="text"
            placeholder="Procurar..."
            className="w-full max-w-full border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black"
          />
        </div>

        {/* Cart */}
        <div className="flex items-center">
          <button className="relative p-2 md:p-3 rounded-md hover:bg-gray-100">
            <FiShoppingCart className="text-3xl md:text-4xl text-black" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm md:text-sm font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              5
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
