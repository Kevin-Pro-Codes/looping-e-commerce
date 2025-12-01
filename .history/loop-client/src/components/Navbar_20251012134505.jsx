import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Initialize login state from localStorage on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
  }, []);

  // ✅ Close popup if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.setItem("loggedIn", "false");
    setProfileOpen(false);
    navigate("/");
  };

  // ✅ Handle "Entrar" click → go to login page
  const handleLoginClick = () => {
    setProfileOpen(false);
    navigate("/logar");
  };

  // ✅ Handle "Meu Perfil" click
  const handleProfileClick = () => {
    setProfileOpen(false);
    navigate("/perfil");
  };

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-3 shadow-md relative">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-indigo-600">
        MinhaApp
      </Link>

      {/* Profile Button */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <User size={22} />
          <span className="text-sm font-medium">Conta</span>
        </button>

        {/* Profile Popup */}
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2">
            {!loggedIn ? (
              <>
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Entrar
                </button>
                <Link
                  to="/registrar"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Registrar
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
