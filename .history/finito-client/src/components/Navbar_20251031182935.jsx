import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import { useNavigate } from "react-router-dom";

// SIMPLE VERSION - Remove all complex logic
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();
  const navigate = useNavigate();
  
  // EXTREMELY SIMPLE AUTH STATE
  const [authState, setAuthState] = useState({
    loggedIn: false,
    isAdmin: false
  });

  // ONE SINGLE useEffect for auth
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const loggedIn = localStorage.getItem("loggedIn");
        const userStr = localStorage.getItem("user");
        
        const isLoggedIn = !!(token || loggedIn === "true");
        let isAdmin = false;
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            isAdmin = user?.type === 'admin' || user?.is_admin === true || localStorage.getItem("isAdmin") === "true";
          } catch (e) {
            console.log("Error parsing user:", e);
          }
        }
        
        setAuthState({
          loggedIn: isLoggedIn,
          isAdmin: isAdmin
        });
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState({ loggedIn: false, isAdmin: false });
      }
    };

    // Initial check
    checkAuth();

    // Listen for login events
    const handleAuthChange = () => {
      setTimeout(checkAuth, 100);
    };

    window.addEventListener("loginStateChange", handleAuthChange);
    
    return () => {
      window.removeEventListener("loginStateChange", handleAuthChange);
    };
  }, []);

  // Click outside handler
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
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  // SIMPLE LOGOUT
  const handleLogout = () => {
    console.log("Logging out...");
    
    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isAdmin");
    
    // Update state
    setAuthState({ loggedIn: false, isAdmin: false });
    setProfileOpen(false);
    
    // Navigate
    navigate("/");
  };

  const handleLogoClick = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const ProfilePopup = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-black p-3 z-50"
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl text-black" />
        <span className="text-lg font-bold text-black">Conta</span>
      </div>
      
      {authState.loggedIn ? (
        <>
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => {
              setProfileOpen(false);
              navigate(authState.isAdmin ? "/admin" : "/profile");
            }}
          >
            <FaUserCircle className="text-xl" />
            <span>{authState.isAdmin ? "Admin" : "Minha Conta"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Sair
          </button>
        </>
      ) : (    
        <>
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2"
            onClick={() => { 
              setProfileOpen(false); 
              navigate("/login");
            }}
          >
            Entrar
          </button>

          <button
            onClick={() => {
              setProfileOpen(false);
              navigate("/register");
            }}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Registrar
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 py-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          
          {/* Logo */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 cursor-pointer ml-1"
          >
            <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold">LOGO</span>
            </div>
          </div>

          {/* Search + Icons */}
          <div className="flex flex-col sm:flex-row ml-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Flag */}
              <div 
                className="h-8 w-12 bg-gray-200 rounded cursor-pointer flex items-center justify-center"
                onClick={toggleLanguage}
              >
                <span className="text-sm font-bold">{language === "en" ? "EN" : "PT"}</span>
              </div>

              {/* Search box */}
              <div className="relative flex-1 min-w-[150px] max-w-[350px]">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black"
                />
              </div>

              {/* Cart + Profile */}
              <div className="flex items-center space-x-3 relative">
                {/* Cart */}
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl text-black" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>

                {/* Profile Icon */}
                <button
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setProfileOpen(prev => !prev)}
                >
                  <FiUser className={`text-2xl ${authState.isAdmin ? "text-green-600" : "text-black"}`} />
                  {authState.loggedIn && (
                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full border border-white ${authState.isAdmin ? "bg-green-500" : "bg-green-500"}`}></span>
                  )}
                </button>

                {profileOpen && <ProfilePopup />}
              </div>
            </div>
          </div>
        </div>

        {/* Simple menu button */}
        <div className="w-full flex items-center bg-white mt-2">
          <button
            className="w-10 h-10 flex flex-col justify-center items-center p-2 rounded-full hover:bg-gray-100 ml-3"
            onClick={() => setMenuOpen(true)}
          >
            <span className="block w-6 h-0.5 bg-black mb-1"></span>
            <span className="block w-6 h-0.5 bg-black mb-1"></span>
            <span className="block w-6 h-0.5 bg-black"></span>
          </button>
        </div>
      </nav>

      {/* Simple menu drawer */}
      {menuOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 hover:bg-gray-100 rounded cursor-pointer">Masculino</div>
            <div className="p-3 hover:bg-gray-100 rounded cursor-pointer">Feminino</div>
            <div className="p-3 hover:bg-gray-100 rounded cursor-pointer">Infantil</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;