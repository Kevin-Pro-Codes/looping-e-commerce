import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 max-w-screen-4xl flex flex-wrap items-center justify-center md:justify-center">
 
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-21 w-21" />
    <span
  className="font-bold text-4xl tracking-wide leading-tight text-transparent"
  style={{
    fontFamily: "Calibri, sans-serif",
    WebkitTextStroke: "2px black", // thicker outline
  }}
>
  Loop Shop
</span>

        </div>

        {/* Search Bar */}
        <div className="mx-auto w-80">
          <input
            type="text"
            placeholder="Procurar..."
            className="w-full border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-500 text-black placeholder-black"
          />
        </div>

        {/* Cart */}
        <div className="flex items-center">
          <button className="relative p-3 rounded-md hover:bg-gray-100">
            <FiShoppingCart className="text-4xl text-black" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
              5
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
