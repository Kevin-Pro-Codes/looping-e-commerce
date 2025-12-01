import React from "react";
import { FiShoppingCart, FiMenu } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-1 px-6 sm:px-10 py-1 sm:py-4">
        
        {/* Logo + Title + Hamburger */}
        <div className="flex items-center space-x-3 -mb-2 sm:mb-0 flex-shrink-0 -ml-4">
          <img src={logo} alt="Logo" className="h-24 w-24 sm:h-28 sm:w-28" />
          <span
            className="font-bold text-4xl sm:text-5xl tracking-wide leading-tight text-transparent whitespace-nowrap"
            style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black" }}
          >
            Loop Shop
          </span>

          {/* Hamburger Icon */}
          {/* Hamburger Icon */}
<button className="ml-3 p-3 sm:p-4 rounded-full bg-black-200 hover:bg-gray-300 flex items-center justify-center">
  <FiMenu className="text-4xl sm:text-5xl text-black" />
</button>

        </div>

        {/* Search + Cart */}
        <div className="flex w-full sm:w-auto justify-between items-center gap-3 min-w-0 mb-0">
          <input
            type="text"
            placeholder="Procurar..."
            className="flex-1 min-w-0 border border-black rounded-md py-3 ml-3 px-4 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-lg sm:text-xl
            mb-10"
          />

          <div className="flex-shrink-0 flex items-center">
            <button className="relative p-3 sm:p-4 rounded-md hover:bg-gray-100">
              <FiShoppingCart className="text-4xl sm:text-5xl text-black" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
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
