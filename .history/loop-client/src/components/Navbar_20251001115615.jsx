import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from '../assets/logo.png';


const Navbar = () => {
  return (
 <nav className="bg-white-500">
  <div className="container mx-auto px-4 py-4 flex flex-col items-center space-y-4">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <img src={logo} alt="Logo" className="h-23 w-23" />
      <span className="font-bold text-2xl text-black"></span>
    </div>

    {/* Search Bar */}
    <div className="w-full md:w-1/2 bg-gray">
      <input
        type="text"
        placeholder="Procurar..."
        className="w-full border border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder-black" 
      />
    </div>

    {/* Cart */}
<div className="flex items-center">
  <button className="relative bg-black text-white p-4 rounded-lg hover:bg-gray-800">
    <FiShoppingCart className="text-5xl text-white" /> {/* bigger icon */}
    <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
      5
    </span>
  </button>
</div>




  </div>
</nav>


  );
};

export default Navbar;