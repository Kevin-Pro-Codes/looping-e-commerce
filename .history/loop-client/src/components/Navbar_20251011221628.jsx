import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import logo from '../assets/finito.png';
import enFlag from "../assets/us.png";
import ptFlag from "../assets/br.png";
import eightBall from "../assets/8ball.png";
import { useNavigate } from "react-router-dom";

const categories = [
   "Finito", "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Esportes", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Literatura", "Psicodélico", "Yoga", "Espiritualidade", "Astrologia", "Aleatório"
];

const products = [
      "Masculino",
      "Feminino",
      "Camisetas",
      "Regatas",
      "Blusas",
      "Shorts",
      "Toucas",
      "Bonés",
      "Meias",
      "Chinelos",
      "Óculos",     
      "Canecas",
      "Almofadas",
      "Tapetes",
      "Ingressos"
];


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedStatus = localStorage.getItem("loggedIn");
    
    if (token || storedStatus === "true") {
      setLoggedIn(true);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false); // Close popup after login
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("token");
    setProfileOpen(false); // Close popup after logout
    navigate("/");
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  
  const ProfilePopup = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl sm:text-2xl text-black" />
        <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
      </div>

      {loggedIn ? (
      
        <>
          <button
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => {
              navigate("/perfil");
              setProfileOpen(false);
            }}
          >
              <FaUserCircle className="text-xl" />
            {/*<span>Meu Perfil</span>*/}
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
            className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
            onClick={() => {
              handleLogin();
              navigate("/logar");
            }}
          >
         
            <span>Entrar</span>
          </button>
          <button
            onClick={() => {
              navigate("/registrar");
              setProfileOpen(false);
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
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Logo + Title */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer ml-1"
          >
            {/* Your SVG logos here */}
           <svg
  viewBox="0 0 970 970"
  xmlns="http://www.w3.org/2000/svg"
  className="w-auto h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 drop-shadow-md transition-transform duration-300 hover:scale-105"
>
  <defs>
    <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#111" className="dark:stop-[#fff]" />
      <stop offset="100%" stopColor="#555" className="dark:stop-[#ccc]" />
    </linearGradient>
  </defs>
  <path
    d="M 406.617 913.539 C 361.002 905.487 297.406 874.062 249.066 835.687 C 167.369 770.831 113.36 680.183 96.0563 578.88 C 91.4632 551.99 90.5532 540.531 90.5859 510 c 0.04086 -38.1081 3.36073 -66.8921 11.4709 -99.4558 c 18.9388 -76.0422 57.7884 -144.109 113.07 -198.106 c 45.0029 -43.9569 93.0091 -73.9218 152.805 -95.3791 c 79.3373 -28.4695 163.724 -32.4217 246.849 -11.561 c 49.3718 12.3902 95.3767 33.1886 136.719 61.8095 c 26.0517 18.0354 39.8527 29.6522 62.2881 52.4305 c 40.8989 41.524 70.2914 88.2591 91.6724 145.762 c 12.3919 33.3276 20.6853 69.1819 24.7499 107 c 1.94095 18.0593 1.62111 64.5309 -0.56781 82.5 c -11.515 94.5279 -50.1329 175.302 -117.006 244.732 c -46.1619 47.9269 -112.163 88.8564 -172.663 107.073 c -33.3039 10.0281 -51.2658 10.3086 -70.6382 1.10325 c -22.7917 -10.8302 -39.0726 -35.9109 -40.809 -62.8667 c -0.26721 -4.14805 -0.74081 -58.1842 -1.05245 -120.08 l -0.56662 -112.538 l 9.79641 -2.22765 c 22.0166 -5.00646 37.7526 -13.682 53.8628 -29.6955 c 20.7361 -20.6116 30.7758 -43.0846 30.8255 -69 c 0.0496 -25.8499 -9.44997 -49.1724 -27.8332 -68.3339 C 576.052 424.918 557.048 414.575 530.5 408.846 c -3.63149 -0.78365 -12.316 -1.25972 -22 -1.20601 c -13.8526 0.0768 -17.317 0.43686 -25.8132 2.68265 c -11.8751 3.13895 -23.2802 7.96351 -34.0055 14.3849 c -9.96552 5.96652 -26.647 22.1118 -32.8479 31.7921 c -19.1704 29.927 -20.832 66.7728 -4.47407 99.2115 c 10.2114 20.2498 29.5112 37.9812 51.7306 47.5265 C 472.483 607.273 487.882 612 491.635 612 h 2.41141 L 493.773 732.75 L 493.5 853.5 l -3.42019 9.8824 c -6.93452 20.0368 -19.7042 34.914 -37.7412 43.97 c -12.6176 6.33504 -30.8801 8.80603 -45.7216 6.18633 Z"
    fill="url(#logoGradient)"
    stroke="url(#logoGradient)"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    shapeRendering="geometricPrecision"
  />
</svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14">
              <path d="M 367.981 139.25 C 359.442 134.884 358.606 132.434 358 110 l -0.5 -18.5 l -3.26941 -0.314806 c -4.76058 -0.458388 -6.59554 -3.77087 -6.00873 -10.847 C 348.741 74.0721 350.473 72 355.191 72 C 357.972 72 358 71.9381 358 65.7 c 0 -3.56667 0.52063 -6.82063 1.2 -7.5 c 0.73924 -0.739236 4.36518 -1.2 9.4433 -1.2 c 7.38477 0 8.40542 0.23147 9.8 2.22251 c 0.93154 1.32996 1.5567 4.34192 1.5567 7.5 V 72 h 5.30887 C 393.089 72 394.5 73.4224 394.5 81.2657 C 394.5 89.7671 393.408 91 385.878 91 H 380 v 14.9648 c 0 14.1121 0.118 15.028 2.07088 16.0731 c 1.47775 0.79087 2.93807 0.806 5.09867 0.0528 c 5.32097 -1.8549 7.83045 0.72196 7.83045 8.04071 c 0 6.2588 -2.18234 9.42523 -7.40176 10.7395 c -7.61943 1.91859 -13.6739 1.41832 -19.6173 -1.62095 Z m 75.2241 0.91062 c -11.1725 -3.97477 -17.3178 -12.1139 -19.3223 -25.5917 c -0.86789 -5.83527 -0.866 -9.44437 0.008 -14.7349 c 3.30552 -20.0157 15.8013 -29.6671 37.0922 -28.6492 c 14.9964 0.716987 23.6795 6.73871 28.1849 19.5462 c 2.86645 8.14849 2.3023 25.3402 -1.08279 32.996 c -2.5755 5.8248 -8.653 11.9671 -15.2353 15.3978 c -6.14727 3.20393 -21.9938 3.75762 -29.6444 1.0358 Z m 21.3974 -19.2772 c 2.65973 -2.47284 4.39921 -8.21538 4.39203 -14.4994 C 468.982 95.326 465.024 89.5 457.524 89.5 C 449.897 89.5 446 95.2312 446 106.448 c 0 8.5066 2.30872 14.3326 6.40376 16.1597 c 3.82426 1.70628 9.34894 0.92552 12.1986 -1.72393 Z M 51.2225 139.443 L 49 137.887 V 96.0983 c 0 -41.1974 0.02973 -41.8152 2.10261 -43.6933 c 1.90585 -1.72671 4.11349 -1.93361 23.5903 -2.21083 c 24.5378 -0.349251 25.6447 -0.07421 26.7815 6.65438 c 0.80176 4.74557 -0.90239 11.718 -3.06705 12.5486 C 97.5433 69.7287 91.0232 70 83.9182 70 H 71 v 8.5 v 8.5 h 12.3089 c 8.57327 0 12.8529 0.397817 14.1015 1.31081 c 1.97241 1.44226 3.24341 8.94813 2.21146 13.0597 C 98.3396 106.479 96.8417 107 83.4286 107 H 71 v 15.4433 C 71 140.823 70.8953 141 60 141 c -4.31431 0 -7.3147 -0.53213 -8.77749 -1.5567 Z m 87 0 C 136.006 137.891 136 137.8 136 106.5 C 136 69.8821 135.325 72 147 72 c 11.6753 0 11 -2.1179 11 34.5 c 0 36.6179 0.67527 34.5 -11 34.5 c -4.31431 0 -7.3147 -0.53213 -8.77749 -1.5567 Z m 60 0 C 196.006 137.891 196 137.8 196 106.5 C 196 75.1996 196.006 75.1091 198.223 73.5567 C 202.651 70.4549 215 72.1505 215 75.8602 c 0 1.55096 0.0333 1.54142 6.5 -1.86024 c 12.5422 -6.59758 26.3032 -2.61697 32.8416 9.5 c 2.019 3.74162 2.17942 5.62634 2.48353 29.1777 l 0.32512 25.1777 l -2.57208 1.68529 c -3.68272 2.41302 -16.1896 1.71108 -18.1872 -1.02073 c -1.07725 -1.47323 -1.3943 -6.42648 -1.40572 -21.9611 c -0.017 -23.0591 -0.46053 -24.8851 -6.16129 -25.3635 c -2.89773 -0.243139 -4.35567 0.33253 -7.22701 2.85359 L 218 97.2072 V 117.104 C 218 141.156 218.071 141 207.223 141 c -4.5157 0 -7.5192 -0.51951 -9 -1.5567 Z m 99 0 C 295.006 137.891 295 137.802 295 106.466 V 75.0461 l 2.49696 -1.63607 c 3.61073 -2.36584 16.141 -1.62563 18.1121 1.06994 C 316.725 76.0056 317 82.3841 317 106.691 C 317 142.61 317.506 141 306.223 141 c -4.5157 0 -7.5192 -0.51951 -9 -1.5567 Z M 140.308 67.9904 c -3.9106 -1.5752 -5.60347 -5.41752 -5.09394 -11.5618 c 0.67383 -8.12546 2.83502 -9.92863 11.9 -9.92863 c 6.49442 0 7.25177 0.224336 9.47222 2.80576 c 1.85672 2.15856 2.41342 3.96141 2.41342 7.81574 c 0 2.75549 -0.48622 5.91849 -1.08049 7.02889 c -2.13449 3.98833 -11.9368 6.12566 -17.6112 3.84 Z M 298.364 67.8304 C 293.431 65.442 292.243 54.1544 296.413 49.3058 C 298.634 46.7243 299.391 46.5 305.886 46.5 c 8.78551 0 11.1601 1.8383 11.8409 9.16655 c 0.60955 6.56152 -0.93815 10.1061 -5.18808 11.8818 c -3.9771 1.66174 -11.035 1.80218 -14.1744 0.282041 Z" fill="white" stroke="black" strokeWidth="7" />
            </svg>
          </div>

          {/* Flag + Search + Icons */}
          <div className="flex flex-col sm:flex-row sm:ml-5 ml-4 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Flag */}
              <img 
                src={currentFlag} 
                alt={language === "en" ? "English" : "Português"} 
                className="h-7 w-11 sm:h-8 sm:w-10 object-contain cursor-pointer"
                onClick={toggleLanguage}
              />

              {/* Search box */}
              <div className="relative flex-1 min-w-[150px] max-w-[350px] sm:max-w-[500px] w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" /> 
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-1.5 sm:py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
                />
              </div>

              {/* Cart + Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0 relative">
                {/* Cart */}
                <button className="relative p-1 sm:p-1 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    5
                  </span>
                </button>

                {/* Main Navbar Profile Icon */}
             <button
  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100 relative"
  onClick={() => setProfileOpen(prev => !prev)}
>
  {loggedIn ? (
    <FiUser className="text-2xl sm:text-3xl text-black" />
  ) : (
    <FiUser className="text-2xl sm:text-3xl text-black" />
  )}
  {loggedIn && (
    <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
  )}
</button>

  {/* Profile Popup */}
  {profileOpen && <ProfilePopup />}
    </div>
    </div>
    </div>
    </div>

{/* Second navbar: Hamburger + items */}
<div className="w-full flex items-center bg-white">

  {/* Hamburger button */}
  <button
    className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300
               absolute top-1 right-3 sm:static sm:mr-1 ml-3"
    onClick={() => setMenuOpen(true)}
  >
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
  </button>


{/* Horizontal items (hidden on mobile) */}
<div className="relative w-full">
  {/* Scrollable items */}
  <div className="hidden sm:flex ml-0 sm:ml-2 flex-nowrap gap-4 overflow-x-auto overflow-y-hidden items-center whitespace-nowrap pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] tracking-widest">
    {[
      "Masculino",
      "Feminino",
      "Camisetas",
      "Regatas",
      "Blusas",
      "Shorts",
      "Toucas",
      "Bonés",
      "Meias",
      "Chinelos",
      "Óculos",     
      "Canecas",
      "Almofadas",
      "Tapetes",
      "Ingressos"
      
    ].map((item, idx) => (
      <span
        key={idx}
        className="text-black text-sm sm:text-base md:text-lg px-2 hover:text-yellow-400 cursor-pointer font-bold"
        style={{ fontFamily: "Calibri, sans-serif" }}
      >
        {item}
      </span>
    ))}
  </div>

  {/* 8-ball overlay on the right (hidden on small screens) */}
  <img
    src={eightBall}
    alt="8ball"
    className="hidden sm:block h-8 w-8 sm:h-8 sm:w-8 object-contain cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform"
  
  />
</div>








</div> 
       
</nav>

 {/* Left-side menu drawer */}
{menuOpen && (
  <div
    className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5"
    style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
  >
    
    {/* Drawer Profile / Login */}
    <div
      className="flex items-center gap-3 mb-6 cursor-pointer"
      onClick={() => setProfileOpen(prev => !prev)}
    >
      <div className="relative">
        <FiUser className="text-3xl text-black" />
        {loggedIn && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </div>
   <span
    className="text-2xl sm:text-2xl leading-tight ml-3 mr-3 whitespace-nowrap"
    style={{ fontFamily: "Calibri, sans-serif" }}
  >
    {loggedIn ? "Logado" : "Logar ou Cadastrar"}
  </span>
    </div>

{/*}
    {profileOpen && (
      <div className="mb-4">
        <ProfilePopup />
      </div>
    )}
*/}

 {profileOpen && (
    
        <ProfilePopup />
     
    )}

    {/* Single scrollable container for headers + lists */}
    <div className="flex-1 overflow-y-auto drawer-scroll">
      
     

     

 

 {/* Categorias Header */}
      <div className="flex justify-between items-center flex-shrink-0 mb-4">
        <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
          Categorias
        </h2>
      </div>

      {/* Categorias list */}
      <ul className="space-y-3">
        {categories.map((cat, index) => (
          <li
            key={index}
            className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
          >
            {cat}
          </li>
        ))}
      </ul>

{/* Produtos Header */}
      <div className="flex justify-between items-center flex-shrink-0 mb-4">
        <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap mt-1">
          Produtos
        </h2>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-9 right-2 rounded-full hover:bg-transparent transition"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          <div style={{ position: "relative", width: "2.3rem", height: "2.3rem" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "0.3rem",
                backgroundColor: "red",
                borderRadius: "9999px",
                transform: "translate(-50%, -50%) rotate(45deg)",
                border: "1px solid black",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "0.3rem",
                backgroundColor: "red",
                borderRadius: "9999px",
                transform: "translate(-50%, -50%) rotate(-45deg)",
                border: "1px solid black",
              }}
            />
          </div>
        </button>
      </div>

      {/* Produtos list */}
      <ul className="space-y-3 mb-6">
        {products.map((cat, index) => (
          <li
            key={index}
            className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
          >
            {cat}
          </li>
        ))}
      </ul>



    </div>
    </div>


      )}
    </>
  );
};

export default Navbar;