import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import logo from '../assets/logo.png';

const categories = [
  "Rock and Roll",
  "Martial Arts: MMA, Jiu-Jitsu, Muay Thai, Karate, Taekwondo, Krav Maga",
  "Soccer",
  "Basketball",
  "Motorcycling",
  "Custom Art",
  "Cartoons: SpongeBob, Simpsons, Courage, Flapjack",
  "Superheroes",
  "Professions",
  "Programming: Languages, Cybersecurity",
  "Countries",
  "Custom Fine Art",
  "Money",
  "Funny",
  "Women",
  "Psychedelics",
  "Yoga",
  "Spirituality",
  "Movies: Fight Club, V for Vendetta, Pulp Fiction, Mr. Robot, Game of Thrones",
  "Games: Crash, Mario",
  "Cars",
  "Anime",
  "Music",
  "Nature",
  "Travel",
  "Food",
  "Science",
  "Technology",
  "Fitness",
  "Photography"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-1 px-6 sm:px-10 py-1 sm:py-4">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3 -mb-2 sm:mb-0 flex-shrink-0 -ml-4">
            <img src={logo} alt="Logo" className="h-24 w-24 sm:h-28 sm:w-28" />
            <span
              className="font-bold text-4xl sm:text-5xl tracking-wide leading-tight text-transparent whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif", WebkitTextStroke: "0.04em black" }}
            >
              Loop Shop
            </span>
          </div>

          {/* Search + Cart */}
          <div className="flex w-full sm:w-auto justify-between items-center gap-3 min-w-0 mb-0">
            <input
              type="text"
              placeholder="Procurar..."
              className="flex-1 min-w-0 border border-black rounded-md py-3 ml-3 px-4 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-lg sm:text-xl"
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

        {/* Second navbar: Hamburger */}
        <div className="w-full flex justify-start px-6 sm:px-10 py-1 bg-[rgba(0,0,0,0.8)] shadow-inner">
          <button 
            className="p-3 flex items-center justify-center rounded-full"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="text-4xl text-white" />
          </button>
        </div>
      </nav>

      {/* Left-side menu drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-black">Categories</h2>
          <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="text-2xl" />
          </button>
        </div>
        <ul className="p-4 space-y-2 overflow-y-auto h-full">
          {categories.map((cat, index) => (
            <li key={index} className="p-2 rounded hover:bg-gray-100 cursor-pointer">
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
