import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-4 px-4 sm:px-8 py-2">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-21 w-21" />
          <span
            className="font-bold text-4xl tracking-wide leading-tight text-transparent whitespace-nowrap"
            style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "2px black" }}
          >
            Loop Shop
          </span>
        </div>









        {/* Search Bar */}
        <div className="w-full sm:w-auto flex justify-center my-2 sm:my-0">
          <input
            type="text"
            placeholder="Procurar..."
            className="w-full sm:w-80 border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black"
          />
        </div>

        {/* Cart */}
        <div className="flex items-center">
          <button className="relative p-2 sm:p-3 rounded-md hover:bg-gray-100">
            <FiShoppingCart className="text-3xl sm:text-4xl text-black" />
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