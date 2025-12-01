import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { IoMdLogIn } from "react-icons/io";
import logo from "../assets/finito.png";
import enFlag from "../assets/eng.png";
import ptFlag from "../assets/pt.png";

import { useNavigate } from "react-router-dom";

const categories = [
  "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol",
  "Basquete", "Luta", "Motociclismo", "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Feminino", "Literatura", "Psicodélico", "Yoga",
  "Espiritualidade", "Astrologia", "Aleatório"
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 pb-2 ml-1">
          {/* Logo + Title */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 flex-shrink-0"
          >
            {/* Inline SVG Path Logo */}
            <svg
              viewBox="0 0 970 970"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-auto sm:h-17"
            >
              <path
                d="M 406.617 913.539 C 361.002 905.487 297.406 874.062 249.066 835.687 C 167.369 770.831 113.36 680.183 96.0563 578.88 ..."
                fill="black"
                stroke="black"
                strokeWidth="5"
              />
            </svg>

            {/* Title */}
            <svg
              viewBox="0 0 500 200"
              xmlns="http://www.w3.org/2000/svg"
              className="w-auto h-14"
            >
              <path
                d="M 367.981 139.25 C 359.442 134.884 358.606 132.434 358 110 l -0.5 -18.5 ..."
              />
            </svg>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
