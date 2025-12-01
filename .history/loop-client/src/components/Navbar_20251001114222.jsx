import React from "react";
import { FiShoppingCart } from "react-icons/fi";



const Navbar = () => {
  return (
 <nav className="bg-white-500 shadow-md">
  <div className="container mx-auto px-4 py-4 flex flex-col items-center space-y-4">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <img src="/logo.png" alt="Logo" className="h-12 w-12" />
      <span className="font-bold text-2xl text-black-800">Loop</span>
    </div>

    {/* Search Bar */}
    <div className="w-full md:w-1/2 bg-grey-500">
      <input
        type="text"
        placeholder="Search products..."
        className="w-full border border-black-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-grey-500"
      />
    </div>

    {/* Cart */}
    <div className="flex items-center">
      <button className="relative">
        <FiShoppingCart className="text-3xl text-red-700" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          3
        </span>
      </button>
    </div>
  </div>
</nav>

  );
};

export default Navbar;