import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
<div className="flex flex-nowrap justify-center items-center w-full gap-2 px-2 sm:px-4 md:px-8">
  {/* Logo + Text */}
  <div className="flex items-center space-x-1">
    <img src={logo} alt="Logo" className="h-12 w-12" />
    <span
      className="font-bold text-2xl text-transparent whitespace-nowrap"
      style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "2px black" }}
    >
      Loop Shop
    </span>
  </div>

  {/* Search */}
  <div className="w-48 sm:w-64 md:w-80 ml-2">
    <input
      type="text"
      placeholder="Procurar..."
      className="w-full border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black"
    />
  </div>

  {/* Cart */}
  <div className="flex items-center ml-2">
    <button className="relative p-2 rounded-md hover:bg-gray-100">
      <FiShoppingCart className="text-3xl text-black" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        5
      </span>
    </button>
  </div>
</div>


    </nav>
  );
};

export default Navbar;
