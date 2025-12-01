import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import { IoOpenOutline } from "react-icons/io5";
import { BsSquare } from "react-icons/bs";
import logo from '../assets/finito.png';
import enFlag from "../assets/us.png";
import ptFlag from "../assets/br.png";
import eightBall from "../assets/8ball.png";
import { useNavigate } from "react-router-dom";

const categories = [
  "Finito", "Rock & Metal", "Games", "Cinema", "Esportes",
  "Viagem", "Motociclismo",
  "Tecnologia", "Profissões", "Países", "Engraçados", "Motivacional", "Política", "Gênios", "Memes", "Psicodélico", "Minimalismo", "Sustentável", "Sci-Fi", "Espiritualidade", "Astrologia", "Aleatório"
];

// Subcategorias de Esportes
const sportsSubcategories = [
  "Fitness", "Futebol", "Basquete", "Skateboarding", "Luta", "Hiking"
];

// Subcategorias de Cinema
const cinemaSubcategories = [
  "Desenhos", "Filmes", "Séries", "Super-heróis"
];

// Subcategorias de Espiritualidade
const spiritualitySubcategories = [
  "Yoga", "Cristianismo", "Judaismo", "Hinduismo", "Islamismo", "Esoterismo", "Espiritismo", "Umbanda", "Candomblé", "Bruxaria", "Mitologia"
];

// Rock Music Subgenres
const rockSubgenres = {
  "Classic Rock / Mainstream": [
    "Classic rock", "Soft rock", 
    "Pop rock", "Blues rock", "Folk rock", "Garage rock", "Rock Brasileiro"
  ],
  "Punk & Alternative": [
    "Punk rock", "Post-punk", "Hardcore punk", "Pop punk",
    "Emo / Post-emo", "Indie rock", "Grunge", "Noise rock", "College rock"
  ],
  "Progressive / Experimental": [
    "Progressive rock (Prog rock)", "Art rock", "Psychedelic rock",
    "Krautrock", "Space rock", "Math rock"
  ],
  "Hard Rock / Arena Rock": [
    "Hard rock", "Arena rock / Stadium rock", "Southern rock",
    "Glam rock / Glitter rock"
  ],
  "Outros / Regional": [
    "Surf rock", "Rockabilly", "Garage rock revival",
    "Stoner rock", "Neo-psychedelia"
  ]
};

// Metal Music Subgenres
const metalSubgenres = {
  "Traditional / Classic Metal": [
    "Heavy metal", "NWOBHM (New Wave of British Heavy Metal)",
    "Speed metal", "Power metal"
  ],
  "Extreme Metal": [
    "Thrash metal", "Death metal", "Black metal", "Doom metal",
    "Viking / Folk metal", "Gothic metal"
  ],
  "Modern / Fusion Metal": [
    "Metalcore", "Deathcore", "Progressive metal", "Industrial metal",
    "Nu-metal", "Alternative metal", "Symphonic metal"
  ],
  "Derivative / Experimental Styles": [
    "Stoner metal", "Sludge metal", "Post-metal", "Djent", "Groove metal"
  ]
};

const products = [
  "Masculino",
  "Feminino",  
  "Infantil",  
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
  const [sportsExpanded, setSportsExpanded] = useState(false);
  const [cinemaExpanded, setCinemaExpanded] = useState(false);
  const [spiritualityExpanded, setSpiritualityExpanded] = useState(false);
  const [rockExpanded, setRockExpanded] = useState(false);
  const [metalExpanded, setMetalExpanded] = useState(false);
  const [rockSubgenresExpanded, setRockSubgenresExpanded] = useState(false);
  const [expandedRockCategories, setExpandedRockCategories] = useState({});
  const [expandedMetalCategories, setExpandedMetalCategories] = useState({});
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

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedStatus = localStorage.getItem("loggedIn");
      const user = localStorage.getItem("user");
      
      const isAuthenticated = (token !== null && token !== "null") || 
                             (storedStatus === "true") || 
                             (user && user !== "null" && user !== "{}");
      
      console.log("Navbar Auth check:", { token, storedStatus, user, isAuthenticated });
      setLoggedIn(isAuthenticated);
    };

    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === "loggedIn" || e.key === "token" || e.key === "user") {
        checkAuthStatus();
      }
    };

    const handleLoginStateChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginStateChange", handleLoginStateChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStateChange", handleLoginStateChange);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const toggleSportsExpanded = () => {
    setSportsExpanded(prev => !prev);
  };

  const toggleCinemaExpanded = () => {
    setCinemaExpanded(prev => !prev);
  };

  const toggleSpiritualityExpanded = () => {
    setSpiritualityExpanded(prev => !prev);
  };

  const toggleRockExpanded = () => {
    setRockExpanded(prev => !prev);
  };

  const toggleMetalExpanded = () => {
    setMetalExpanded(prev => !prev);
  };

  const toggleRockSubgenresExpanded = () => {
    setRockSubgenresExpanded(prev => !prev);
  };

  const toggleRockCategory = (category) => {
    setExpandedRockCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleMetalCategory = (category) => {
    setExpandedMetalCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAllRelated = (category) => {
    if (category === "Rock & Metal") {
      setRockExpanded(true);
      setRockSubgenresExpanded(true);
      setMetalExpanded(true);
    } else if (category === "Esportes") {
      setSportsExpanded(true);
    } else if (category === "Cinema") {
      setCinemaExpanded(true);
    } else if (category === "Espiritualidade") {
      setSpiritualityExpanded(true);
    }
  };

  const handleRegister = () => {
    setProfileOpen(false);
  };
  
  const handleLogin = () => {
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loginTimestamp");
    
    window.dispatchEvent(new Event("loginStateChange"));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'loggedIn',
      newValue: 'false'
    }));
    
    setProfileOpen(false);
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
              const isAdmin = localStorage.getItem("isAdmin") === "true";
              if (isAdmin) {
                navigate("/admin");
              } else {
                navigate("/profile");
              }
              setProfileOpen(false);
            }}
          >
            <FaUserCircle className="text-xl" />
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
              setProfileOpen(false); 
              navigate("/login");
            }}
          >
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              handleRegister();                               
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
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 py-1 sm:py-2 md:py-2 lg:py-2 xl:py-2 2xl:py-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">          

          <div 
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname !== "/") {
                navigate("/");
              }
              setProfileOpen(false);
            }}
            className="flex items-center space-x-1 flex-shrink-0 cursor-pointer ml-1 select-none"
            style={{ pointerEvents: 'auto' }}
          >
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 sm:h-13 md:h-14 lg:h-15 xl:h-16">
              <path d="M 406.617 913.539 C 361.002 905.487 297.406 874.062 249.066 835.687 C 167.369 770.831 113.36 680.183 96.0563 578.88 C 91.4632 551.99 90.5532 540.531 90.5859 510 c 0.04086 -38.1081 3.36073 -66.8921 11.4709 -99.4558 c 18.9388 -76.0422 57.7884 -144.109 113.07 -198.106 c 45.0029 -43.9569 93.0091 -73.9218 152.805 -95.3791 c 79.3373 -28.4695 163.724 -32.4217 246.849 -11.561 c 49.3718 12.3902 95.3767 33.1886 136.719 61.8095 c 26.0517 18.0354 39.8527 29.6522 62.2881 52.4305 c 40.8989 41.524 70.2914 88.2591 91.6724 145.762 c 12.3919 33.3276 20.6853 69.1819 24.7499 107 c 1.94095 18.0593 1.62111 64.5309 -0.56781 82.5 c -11.515 94.5279 -50.1329 175.302 -117.006 244.732 c -46.1619 47.9269 -112.163 88.8564 -172.663 107.073 c -33.3039 10.0281 -51.2658 10.3086 -70.6382 1.10325 c -22.7917 -10.8302 -39.0726 -35.9109 -40.809 -62.8667 c -0.26721 -4.14805 -0.74081 -58.1842 -1.05245 -120.08 l -0.56662 -112.538 l 9.79641 -2.22765 c 22.0166 -5.00646 37.7526 -13.682 53.8628 -29.6955 c 20.7361 -20.6116 30.7758 -43.0846 30.8255 -69 c 0.0496 -25.8499 -9.44997 -49.1724 -27.8332 -68.3339 C 576.052 424.918 557.048 414.575 530.5 408.846 c -3.63149 -0.78365 -12.316 -1.25972 -22 -1.20601 c -13.8526 0.0768 -17.317 0.43686 -25.8132 2.68265 c -11.8751 3.13895 -23.2802 7.96351 -34.0055 14.3849 c -9.96552 5.96652 -26.647 22.1118 -32.8479 31.7921 c -19.1704 29.927 -20.832 66.7728 -4.47407 99.2115 c 10.2114 20.2498 29.5112 37.9812 51.7306 47.5265 C 472.483 607.273 487.882 612 491.635 612 h 2.41141 L 493.773 732.75 L 493.5 853.5 l -3.42019 9.8824 c -6.93452 20.0368 -19.7042 34.914 -37.7412 43.97 c -12.6176 6.33504 -30.8801 8.80603 -45.7216 6.18633 Z m 25.1091 -19.1172 c 15.7271 -3.24852 28.5407 -13.0761 35.8028 -27.4597 c 7.3471 -14.5518 6.85927 -6.30407 7.06574 -119.462 c 0.10236 -56.1 -0.034 -105.895 -0.303 -110.655 l -0.48912 -8.65538 l -7.65127 -2.71232 c -30.1108 -10.6741 -57.3188 -33.737 -71.6624 -60.7448 c -8.91207 -16.7806 -13.4943 -35.6831 -13.4813 -55.6131 c 0.009 -13.3422 0.98164 -20.3675 4.54079 -32.7868 c 10.7765 -37.6038 43.5924 -70.2854 82.9808 -82.6413 c 15.3919 -4.82835 22.9707 -5.95758 40.4709 -6.03013 c 17.889 -0.0742 28.3792 1.55683 44.6041 6.93498 c 31.5066 10.4437 60.8521 35.6217 75.0077 64.3557 c 21.3491 43.3357 14.5155 92.0273 -18.176 129.511 c -14.0383 16.0963 -37.7777 31.613 -57.6038 37.6515 l -6.66797 2.03088 l 0.43215 100.178 C 546.834 783.42 547.217 833 547.447 838.5 c 0.7534 17.9956 5.45322 30.1165 16.0212 41.3191 c 7.75357 8.2192 14.8426 12.2237 26.0554 14.7183 c 9.23693 2.05502 18.296 1.06298 36.9305 -4.04417 c 33.0918 -9.06945 69.3079 -25.8596 101.85 -47.2187 C 798.524 797.185 852.511 733.317 881.955 661.5 C 917.815 574.035 922.113 485.208 894.844 395.109 C 871.897 319.291 829.746 255.529 769.466 205.451 C 742.761 183.265 723.378 170.723 691.5 155.003 C 646.206 132.668 605.1 120.598 553 114.335 c -20.4335 -2.45606 -69.0585 -2.46831 -88 -0.0222 c -49.5577 6.39998 -91.429 18.6758 -132.818 38.9393 c -41.4536 20.2953 -72.3496 42.6811 -107.192 77.6661 c -37.7535 37.9082 -64.21 77.523 -85.2675 127.676 c -31.6724 75.434 -38.6573 164.76 -19.1112 244.406 c 20.3391 82.8768 64.8933 153.618 132.949 211.093 C 300.77 853.961 362.62 885.458 411.5 894.521 c 9.4161 1.746 11.3351 1.73652 20.2261 -0.1 Z M 422 867.467 C 359.165 852.772 299.168 819.777 251.132 773.5 C 205.241 729.289 169.706 670.599 152.136 610 C 133.207 544.713 133.186 474.848 152.077 409 C 186.203 290.045 276.066 198.006 395.5 159.685 c 65.0622 -20.8757 136.292 -22.9715 205.493 -6.04624 c 53.4793 13.0802 103.014 37.129 144.507 70.1569 c 74.2976 59.1399 120.976 140.813 135.568 237.204 c 2.94371 19.4454 3.71582 59.7349 1.57145 82 c -3.796 39.4139 -12.5362 73.8127 -27.523 108.323 C 840.584 684.786 817.94 720.9 795.128 747 C 748.21 800.678 688.936 839.554 622 860.55 c -15.4101 4.83378 -31.2144 8.45979 -36.7326 8.42762 c -5.22165 -0.0304 -11.5235 -3.12279 -14.5081 -7.11919 c -2.9781 -3.98775 -5.07391 -7.87766 -4.53479 -8.41678 c 0.21265 -0.21265 5.31161 -1.32853 11.331 -2.47974 c 41.2868 -7.89603 80.7816 -23.1222 117.756 -45.3978 c 39.8663 -24.0179 79.0866 -60.3548 105.358 -97.6121 c 18.3977 -26.0915 36.193 -60.6684 46.0373 -89.4524 c 29.8108 -87.1642 22.5634 -180.556 -20.642 -266 c -4.72793 -9.35 -11.6991 -21.95 -15.4914 -28 C 782.922 280.387 742.93 241.356 698 214.63 C 652.035 187.289 603.049 171.122 544 163.804 c -15.7378 -1.94773 -57.1941 -1.6535 -74.5 0.5285 c -68.8786 8.68452 -130.775 34.1882 -181.697 74.8657 c -19.636 15.6858 -45.6417 42.5681 -61.2358 63.2999 c -44.3416 58.9506 -68.5767 132.015 -68.5641 206.708 c 0.005 32.1511 2.75433 55.2406 9.97599 83.7932 c 25.0984 99.2324 91.518 181.641 183.596 227.793 c 30.3465 15.2104 65.0543 26.712 94.9717 31.4721 c 4.09907 0.65219 7.45285 1.5567 7.45285 2.01002 c 0 1.7337 -2.93886 6.3339 -5.66072 8.86074 c -7.14659 6.63452 -12.633 7.5367 -26.3393 4.33119 Z m 17.9451 -45.9648 C 375.888 805.63 323.006 776.783 280.453 734.5 C 244.322 698.599 220.66 661.135 202.853 611.636 c -11.1452 -30.9795 -16.8781 -65.3704 -16.8994 -101.376 c -0.0356 -60.1032 15.0436 -113.956 46.3624 -165.575 c 41.7513 -68.8138 112.578 -121.221 191.553 -141.737 c 32.1735 -8.35795 49.3021 -10.4189 86.6319 -10.4237 c 27.1968 -0.004 32.8928 0.27764 46.4281 2.29159 c 22.6845 3.37528 38.5333 7.0741 58.2193 13.5873 C 683.871 231.141 744.283 277.109 783.495 336.5 c 34.2498 51.8754 52.6579 112.001 52.6596 172 c 0.004 138.011 -92.8846 262.106 -228.642 305.455 C 597.532 817.142 570.763 824 568.302 824 C 567.316 824 567 821.483 567 813.636 v -10.3641 l 4.25 -0.59737 c 2.3375 -0.32855 10.8325 -2.40926 18.8777 -4.6238 c 57.0672 -15.7084 109.009 -46.9938 146.732 -88.3793 c 42.314 -46.422 69.4912 -104.121 77.7985 -165.171 c 2.43147 -17.8688 2.41815 -54.2607 -0.026 -71 c -8.04837 -55.1214 -29.4724 -105.541 -62.7486 -147.674 c -10.3211 -13.0681 -33.3558 -35.8489 -47.099 -46.5798 c -62.3892 -48.7144 -137.098 -71.5716 -216.864 -66.3493 c -28.2471 1.84933 -49.2012 5.67039 -72.9205 13.2973 c -41.4524 13.3289 -76.7134 33.3166 -110.156 62.4419 c -42.312 36.8495 -76.4384 92.5357 -90.3096 147.364 c -11.4196 45.1379 -12.3959 89.3279 -2.96304 134.117 c 10.8756 51.6392 38.7609 104.847 74.6908 142.518 c 25.2882 26.5136 53.5654 47.3777 86.6304 63.9196 c 22.4807 11.2467 42.6101 18.5593 67.3575 24.4696 l 13.75 3.28381 v 9.84596 c 0 11.5879 0.98252 11.0742 -14.0549 7.34824 Z M 438.5 769.514 C 386.457 754.385 347.734 731.729 310.384 694.558 C 251.057 635.514 223.915 549.762 238.041 466 c 7.8668 -46.6481 25.7003 -86.5469 54.8617 -122.742 c 9.44375 -11.7215 32.3408 -34.243 44.0976 -43.3745 c 32.4163 -25.1776 74.9292 -44.6993 115.324 -52.9565 c 58.3435 -11.9259 120.818 -5.1253 174.762 19.0236 c 15.2683 6.83508 26.2752 12.996 41.3787 23.1613 c 55.1146 37.0943 93.4042 90.9042 110.569 155.387 c 13.0038 48.851 11.0265 100.061 -5.75309 149 c -5.19245 15.1441 -17.3988 40.9066 -25.8223 54.5 c -34.9691 56.4311 -93.7569 100.461 -159.959 119.804 c -7.7 2.24977 -15.4625 4.37498 -17.25 4.72268 l -3.25 0.6322 v -9.9699 v -9.96991 l 8.25 -2.21571 c 23.1156 -6.20819 52.0248 -18.7373 72.5992 -31.4641 C 714.648 678.219 758.366 609.823 767.078 533.007 C 768.565 519.889 767.745 489.458 765.514 475 C 757.737 424.599 734.98 378.168 700.332 342.01 C 671.936 312.377 641.122 291.971 603.95 278.182 C 568.63 265.082 527.39 259.14 490.427 261.827 C 409.046 267.742 337.105 309.805 292.874 377.333 C 266.096 418.217 252.864 466.153 254.32 517 c 1.78006 62.1607 25.1883 117.294 69.1386 162.843 c 31.8671 33.0258 75.5834 58.9823 118.348 70.2693 L 454 753.33 v 10.3349 c 0 5.68419 -0.1125 10.3067 -0.25 10.2723 c -0.1375 -0.0344 -7 -2.0248 -15.25 -4.42313 Z m 0 -50.9479 C 401.789 706.391 373.614 688.839 345.442 660.593 C 327.226 642.329 317.856 629.598 306.537 607.732 C 281.374 559.124 275.758 508.843 289.43 454.567 C 302.842 401.319 339.579 352.767 389 322.975 C 425.106 301.21 466.049 290 509.435 290 c 55.4837 0 105.669 17.3674 147.512 51.0488 c 32.2805 25.984 54.8465 57.2867 68.8698 95.5334 c 8.30552 22.6522 12.037 42.0397 12.8796 66.9178 c 0.87837 25.9347 -2.02006 46.1898 -10.1622 71.0163 c -15.1524 46.2017 -46.2546 86.9838 -87.1651 114.293 c -21.8482 14.5847 -54.7021 29.8096 -70.619 32.7258 L 567 722.223 V 712.111 C 567 703.927 567.277 702 568.456 702 c 2.56581 0 23.705 -8.5603 34.4291 -13.942 c 13.4216 -6.73545 26.1525 -14.64 38.0754 -23.641 c 10.1605 -7.67046 29.6251 -26.9915 37.1913 -36.917 c 29.5543 -38.77 44.8205 -87.6502 41.0189 -131.337 c -2.24958 -25.8512 -8.54056 -48.5231 -19.7962 -71.3431 c -10.26 -20.8014 -20.411 -35.5722 -34.8598 -50.7253 C 626.508 334.237 574.832 311.88 517 310.277 c -61.0213 -1.69144 -116.527 19.8168 -157.155 60.8967 c -38.1499 38.5743 -57.7601 84.9036 -57.8264 136.616 c -0.0378 29.4511 4.50504 52.1225 15.6219 77.9628 c 19.0964 44.3883 54.7091 81.1888 99.8598 103.19 c 6.6 3.21614 17.4 7.68708 24 9.93543 l 12 4.0879 l 0.28498 10.017 c 0.21805 7.66422 -0.0168 10.0026 -1 9.95589 c -0.70674 -0.0336 -7.13498 -2.00123 -14.285 -4.37251 Z m 5 -48.9542 c -23.5799 -9.5006 -41.8315 -21.2413 -59.4957 -38.2717 c -26.2553 -25.3132 -42.8041 -54.7188 -49.9975 -88.8405 c -3.03545 -14.3985 -3.79097 -40.3732 -1.5988 -54.9665 c 7.85366 -52.282 35.898 -93.462 83.8717 -123.156 c 16.1893 -10.0206 35.6539 -17.5904 57.7203 -22.4472 c 12.2143 -2.68839 43.3046 -3.75567 57.7103 -1.9811 c 48.0843 5.92329 88.9353 28.2142 120.131 65.551 c 18.8604 22.5736 30.4281 46.9944 36.3154 76.6662 c 3.18525 16.0536 3.22299 40.708 0.0862 56.3365 C 679.469 582.217 653.367 621.31 615 648.198 C 602.573 656.907 574.23 671 569.142 671 C 567.095 671 567 670.555 567 661 c 0 -7.32567 0.33429 -10.0038 1.25 -10.0144 c 2.43387 -0.028 21.9484 -9.98892 30.5382 -15.5878 c 35.152 -22.9123 58.4701 -55.1322 68.9346 -95.2507 c 2.58465 -9.90895 2.77518 -11.999 2.74826 -30.1471 c -0.0264 -17.7999 -0.2638 -20.4344 -2.72286 -30.2174 C 663.098 461.283 656.974 447.012 647.245 432 C 623.691 395.659 588.135 371.858 543.058 362.26 c -11.4394 -2.43586 -14.5186 -2.67459 -34.5584 -2.67926 c -20.5947 -0.005 -22.7665 0.17402 -34 2.79951 c -57.0378 13.3309 -99.4967 50.6634 -116.464 102.402 c -4.75926 14.5128 -7.03811 29.4226 -7.03042 45.9979 c 0.0193 41.5985 15.4447 77.1736 46.384 106.974 c 15.0938 14.538 37.6922 28.8949 52.4337 33.3115 L 454 652.317 v 10.3417 c 0 7.65058 -0.32528 10.3203 -1.25 10.2594 c -0.6875 -0.0453 -4.85 -1.53276 -9.25 -3.30557 Z" fill="black" stroke="black" strokeWidth="5" />
            </svg> 

            <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" className="w-auto ml-2 h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12">
              <path d="M 517.798 176.313 C 504.916 172.614 498 166.927 498 160.034 c 0 -2.48096 1.23933 -5.74731 3.95687 -10.4287 l 3.95688 -6.81627 l -2.28668 -3.03718 c -3.92624 -5.21486 -4.80754 -8.7347 -5.32316 -21.2602 c -0.77444 -18.8133 2.87968 -30.2794 12.1382 -38.0877 c 8.21856 -6.93129 18.8941 -8.47131 28.5255 -4.115 c 3.87413 1.75228 4.43148 1.8073 5.98106 0.59039 c 1.27869 -1.00418 4.00326 -1.34196 10.8243 -1.34196 c 8.19646 0 9.39837 0.21129 11.9213 2.09567 l 2.80576 2.09567 l -0.0637 36.7368 c -0.0527 30.4056 -0.32466 37.4097 -1.5781 40.6417 c -5.08089 13.1011 -16.8648 19.8408 -35.8582 20.509 c -7.40863 0.26062 -10.7553 -0.0262 -15.2023 -1.30303 Z M 544.5 168.823 c 7.40713 -1.82096 12.9239 -5.75146 16.2012 -11.5429 L 563.5 152.334 V 116.756 V 81.1774 l -4.93373 -0.271 C 550.166 80.4449 549 81.0212 549 85.6337 v 3.98938 l -4.11299 -3.22447 C 530.337 74.9918 514.334 78.8117 507.314 95.3676 C 504.694 101.547 504.5 102.899 504.5 115.02 c 0 12.2426 0.15632 13.3057 2.62919 17.882 c 6.91698 12.8004 25.473 14.8709 37.7553 4.21277 L 548 134.411 v 3.56567 c 0 4.85868 -2.00956 8.64988 -6.32966 11.9414 c -6.3997 4.87598 -17.1013 5.03415 -25.7286 0.38029 l -5.04809 -2.7231 l -3.5595 6.50414 c -3.45395 6.31127 -3.50916 6.5708 -1.86208 8.75216 c 1.98834 2.63331 10.5868 6.26388 17.3085 7.3082 c 5.75789 0.89459 15.0024 0.33381 21.7195 -1.31752 Z m -14.2571 -41.9572 c -3.67635 -0.91915 -9.34561 -5.33848 -10.8461 -8.45483 c -3.38199 -7.02389 -0.42866 -15.9428 6.61939 -19.9902 c 5.19725 -2.98456 9.75424 -2.99391 14.9145 -0.0306 c 3.98218 2.2868 9.06938 9.69106 9.06938 13.2002 c 0 5.49726 -5.55449 12.5196 -11.7179 14.8146 c -3.44415 1.28242 -4.50903 1.34346 -8.03926 0.46085 Z m 9.53907 -8.01933 c 5.61715 -4.76559 5.04816 -11.0649 -1.39681 -15.4641 c -3.66625 -2.50252 -5.82863 -2.27805 -9.99834 1.03789 c -2.82982 2.25041 -3.69183 3.68140 -4.09709 6.80144 c -0.45822 3.52769 -0.16847 4.29217 2.70212 7.12925 c 4.21346 4.16428 8.2801 4.32184 12.7901 0.49554 Z m -263.353 56.0673 l -2.47975 -2.15184 l 0.27521 -46.9539 l 0.2752 -46.9539 l 2.36078 -1.65845 c 3.5035 -2.46121 17.2786 -2.40527 20.1447 0.0818 l 2.00546 1.74028 l 5.24454 -2.54247 c 7.53354 -3.65215 13.1315 -4.14865 21.0368 -1.86583 c 9.23047 2.65974 15.0805 6.19964 19.0948 11.5151 c 10.6257 14.0699 10.8328 36.6937 0.48066 52.497 c -7.47929 11.4177 -23.5079 16.5848 -36.2448 11.6842 c -2.68241 -1.03207 -5.04491 -1.87649 -5.25 -1.87649 c -0.20508 0 -0.37288 5.40989 -0.37288 12.022 c 0 11.5583 -0.0946 12.1105 -2.45225 14.3181 c -2.32347 2.17554 -2.95604 2.29612 -12.0455 2.29612 c -8.87852 0 -9.77794 -0.1603 -12.073 -2.15183 Z m 19.3413 -22.4565 l 0.27062 -18.1001 l 4.53907 3.6307 c 2.49649 1.99688 6.42471 4.37358 8.72938 5.28155 c 13.5418 5.33504 29.2158 -2.3553 34.3111 -16.8345 c 2.78766 -7.92159 2.5697 -24.3886 -0.40952 -30.9391 c -3.00727 -6.61214 -7.25774 -10.7485 -13.9762 -13.6008 c -11.3608 -4.82329 -22.4046 -2.18807 -32.8449 7.83727 L 292 93.9476 v -6.60208 v -6.60208 h -5.39301 c -3.99523 0 -5.55033 0.35576 -6 1.37261 c -0.8564 1.93663 -0.7601 87.5849 0.0993 88.3307 c 0.38847 0.3371 3.87597 0.49981 7.75 0.36157 L 295.5 170.557 Z m 11.6868 -24.7352 c -7.28945 -3.85743 -11.2327 -10.8309 -10.037 -17.7501 c 1.3711 -7.93408 10.8687 -15.2733 18.2168 -14.0771 c 5.1965 0.84596 10.8591 6.07309 12.7749 11.7924 c 1.4274 4.26133 1.44866 5.2893 0.18471 8.9337 c -3.58096 10.3252 -13.1299 15.3397 -21.1395 11.1011 Z m 11.5755 -7.09157 c 4.00743 -3.72267 5.42047 -7.86305 3.97796 -11.6559 c -1.24789 -3.28115 -6.17365 -7.40632 -8.83753 -7.40115 c -3.06555 0.006 -7.81189 3.22368 -9.61276 6.5169 c -2.40295 4.39422 -1.51303 8.59806 2.59959 12.2801 c 4.22156 3.77958 7.99501 3.86223 11.8727 0.26003 Z M 117.5 150.683 c -7.26764 -1.99974 -12.13 -4.6969 -17.2762 -9.58303 c -13.3144 -12.6416 -14.7231 -37.5228 -2.99801 -52.9501 c 6.44094 -8.47466 20.0204 -14.7407 31.7822 -14.6654 c 12.4078 0.0794 25.3827 6.26676 31.5989 15.0685 c 12.7853 18.1031 7.71771 47.6545 -9.90762 57.776 c -9.02082 5.18028 -23.3613 7.06103 -33.1993 4.35404 Z m 25.8203 -8.64824 c 9.61899 -4.08381 14.4621 -10.3463 17.2566 -22.314 c 4.16376 -17.8317 -4.48496 -33.9056 -20.7685 -38.599 c -6.94888 -2.00284 -18.664 -1.38653 -24.8084 1.30511 c -9.27503 4.06307 -14.5104 9.99864 -17.4234 19.7537 c -4.71387 15.7858 1.55929 33.5146 13.8218 39.0622 c 9.87144 4.4659 22.5285 4.77989 31.9218 0.7919 Z M 121.168 126.089 C 116.574 123.504 112 116.869 112 112.789 c 0 -6.074 5.10803 -13.3091 11.4128 -16.1651 c 6.36423 -2.88303 15.571 0.757 19.7691 7.81599 c 4.37837 7.36213 1.70702 16.3681 -6.35908 21.4385 c -5.3383 3.35569 -9.95447 3.41765 -15.655 0.21016 Z m 12.2173 -4.63723 c 5.36774 -3.66393 7.06885 -9.7184 4.12059 -14.6658 c -4.59241 -7.70639 -14.1947 -6.62038 -18.0045 2.0363 c -1.52363 3.46202 -1.52837 4.03346 -0.0593 7.14973 c 1.83701 3.89667 6.09741 7.28132 9.17319 7.28759 c 1.16333 0.002 3.30982 -0.81116 4.76998 -1.80784 Z m 71.8384 28.7381 c -14.1363 -4.41424 -21.8459 -12.4312 -24.7884 -25.7765 c -1.83595 -8.32675 -1.81425 -14.224 0.0811 -22.0427 c 2.09058 -8.6241 4.53264 -13.0093 10.1433 -18.2143 c 8.27865 -7.68018 22.5674 -12.2958 32.627 -10.5393 c 10.4907 1.83173 16.9088 4.55375 22.8088 9.67355 c 6.28762 5.45618 9.35402 10.64 11.5826 19.5809 c 3.9528 15.858 -3.36559 35.3563 -16.1907 43.1369 c -9.62364 5.83833 -25.2043 7.63491 -36.2636 4.1815 Z M 233 142.256 c 9.24588 -3.75304 14.0707 -9.09651 17.5638 -19.4519 c 2.49706 -7.40264 2.2791 -16.1652 -0.59503 -23.9218 c -9.72545 -26.2465 -54.9784 -25.3561 -62.3615 1.227 c -4.5662 16.4408 -0.33291 32.4715 10.3927 39.3555 c 6.42011 4.12057 12.0584 5.49467 21.5 5.23972 c 6.13587 -0.16569 9.28159 -0.73625 13.5 -2.44857 Z M 212.457 126.854 c -13.6979 -7.24866 -13.1746 -23.5471 0.95697 -29.8057 c 7.03633 -3.11624 15.3792 -0.0301 19.6758 7.27826 c 7.53611 12.8186 -7.64905 29.3981 -20.6328 22.5274 Z m 10.9277 -5.40216 c 5.67524 -3.87382 7.18074 -10.2667 3.61344 -15.3439 c -3.69423 -5.25785 -9.26415 -5.80646 -14.329 -1.41135 c -5.77775 5.01372 -4.91931 13.4018 1.73173 16.9212 c 3.9705 2.101 5.70977 2.06887 8.98385 -0.16596 Z M 23.1313 147.958 L 20 145.671 v -45.4095 c 0 -24.9752 0.279532 -46.0416 0.621181 -46.8142 c 1.1994 -2.71227 5.92424 -3.94429 15.0792 -3.93197 c 4.83981 0.0065 9.83018 0.251397 11.0897 0.544178 C 51.7889 51.222 52 52.8326 52 89.8119 v 34.3198 h 13.4274 c 13.3148 0 13.4448 0.0192 15.5 2.28644 C 82.7025 128.376 83 129.92 83 137.169 c 0 13.2985 1.87082 12.5064 -30.279 12.8185 l -26.4584 0.25677 Z M 76 137.148 V 130.206 H 60.5107 H 45.0215 L 44.7607 93.1091 L 44.5 56.0122 h -9 h -9 l -0.260261 42.9543 c -0.143143 23.6249 -0.04477 43.4424 0.218615 44.039 c 0.365102 0.82699 6.30722 1.0847 25.0103 1.0847 H 76 Z M 369.455 148.035 L 367 145.905 V 112.851 V 79.7968 l 2.37444 -2.06045 c 4.46821 -3.87735 20.7164 -4.05836 25.3483 -0.28239 L 397 79.3105 v 32.7572 v 32.7572 l -2.58889 2.66987 c -2.57169 2.65212 -2.65507 2.66987 -12.5455 2.66987 c -9.23783 0 -10.1337 -0.15376 -12.4111 -2.12997 Z m 20.2539 -5.02908 c 0.56621 -0.64421 0.92051 -13.4187 0.87245 -31.4564 L 390.5 81.1774 h -8.5 h -8.5 l -0.26324 30.3668 c -0.14478 16.7017 -0.0464 30.8571 0.21862 31.4564 c 0.66232 1.49775 14.9372 1.50209 16.2531 0.005 Z M 416.455 148.035 L 414 145.905 v -33.4483 c 0 -39.4731 -0.77369 -36.9194 11.1855 -36.9194 c 5.81987 0 7.59197 0.33132 9.32394 1.74326 l 2.13838 1.74326 l 5.42607 -2.5953 c 6.99857 -3.34744 13.5819 -3.50446 21.3846 -0.51004 c 7.77829 2.98505 11.8129 5.90613 14.8536 10.7542 c 4.80304 7.65782 5.65684 13.2688 5.67301 37.2819 l 0.0148 21.9505 l -2.45455 2.12996 c -2.35083 2.03997 -2.99633 2.12997 -15.2775 2.12997 c -10.2754 0 -13.2889 -0.28323 -15.1685 -1.42566 c -2.17563 -1.32236 -2.54708 -1.32236 -5.12679 0 c -2.16848 1.11156 -5.45611 1.42566 -14.9224 1.42566 c -11.5573 0 -12.2592 -0.10243 -14.5957 -2.12997 Z m 27.87 -5.51168 c 1.38629 -1.32927 1.67561 -4.39347 1.90499 -20.1755 L 446.5 103.739 h 2.5 h 2.5 l 0.27045 18.6082 c 0.23129 15.9137 0.5112 18.8391 1.93308 20.2024 c 1.45553 1.39566 3.04111 1.56386 12.7296 1.35036 L 477.5 143.656 v -22.5619 c 0 -25.5893 -0.68632 -28.8931 -7.21389 -34.7255 c -7.27011 -6.4959 -15.9236 -8.04705 -24.7861 -4.44296 c -4.74837 1.931 -14.5 9.86463 -14.5 11.7968 c 0 0.49771 -0.3375 0.90525 -0.75 0.90562 c -0.4125 0.00038 -0.75 -3.02594 -0.75 -6.72516 V 81.1774 L 424.75 80.9129 L 420 80.6484 v 31.1424 c 0 17.1283 0.3 31.4027 0.66667 31.7209 c 0.36666 0.31818 5.47192 0.57851 11.345 0.57851 c 9.02631 0 10.9312 -0.24248 12.3129 -1.5673 Z M 373.395 71.2842 c -7.25986 -3.84155 -9.76286 -13.2163 -5.14378 -19.2656 c 3.10422 -4.06538 10.4404 -7.1451 15.1817 -6.37325 c 14.4989 2.36033 18.6294 19.0478 6.326 25.5573 c -4.28421 2.2667 -12.1601 2.3059 -16.3639 0.0815 Z m 13.7557 -6.0247 c 3.67922 -2.85267 4.20239 -6.45805 1.46348 -10.0854 c -3.50428 -4.64097 -9.77991 -4.77534 -14.1173 -0.30226 c -3.06005 3.15576 -3.16694 5.80775 -0.35893 8.9055 c 4.05713 4.47575 8.49924 4.98171 13.0128 1.48216 Z" fill="black" stroke="black" strokeWidth="1" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row ml-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <img 
                src={currentFlag} 
                alt={language === "en" ? "English" : "Português"} 
                className="h-7 w-11 sm:h-8 sm:w-10 object-contain cursor-pointer"
                onClick={toggleLanguage}
              />

              <div className="relative flex-1 min-w-[150px] max-w-[350px] sm:max-w-[500px] w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" />
                <input
                  type="text"
                  placeholder="Procurar..."
                  className="w-full border border-black rounded-md py-1.5 sm:py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
                  style={{ fontFamily: "Calibri, Arial, sans-serif" }}
                />
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 relative">
                <button className="relative p-1 sm:p-1 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    5
                  </span>
                </button>

                <button
                  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100 relative"
                  onClick={() => setProfileOpen(prev => !prev)}
                >
                  {loggedIn ? (
                    <FiUser className={`text-2xl sm:text-3xl ${localStorage.getItem("isAdmin") === "true" ? "text-black" : "text-black"}`} />
                  ) : (
                    <FiUser className="text-2xl sm:text-3xl text-black" />
                  )}
                  {loggedIn && (
                    <span className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white ${localStorage.getItem("isAdmin") === "true" ? "bg-yellow-500" : "bg-green-500"}`}></span>
                  )}
                </button>

                {profileOpen && <ProfilePopup />}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center bg-white">
          <button
            className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300
                       absolute top-1 right-3 sm:static sm:mr-1 ml-3"
            onClick={() => setMenuOpen(true)}
          >
            <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
            <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
            <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
          </button>

          <div className="relative w-full">
            <div className="hidden sm:flex ml-0 sm:ml-2 flex-nowrap gap-4 overflow-x-auto overflow-y-hidden items-center whitespace-nowrap pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] tracking-widest">
              {[
                "Masculino",
                "Feminino",
                "Infantil"
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

            <img
              src={eightBall}
              alt="8ball"
              className="hidden sm:block h-8 w-8 sm:h-8 sm:w-8 object-contain cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform"
            />
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5"
          style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
        >
          
          <div
            className="flex items-center gap-3 mb-6 cursor-pointer"
            onClick={() => setProfileOpen(prev => !prev)}
          >
            <div className="relative">
              <FiUser className={`text-3xl ${localStorage.getItem("isAdmin") === "true" ? "text-black" : "text-black"}`} />
              {loggedIn && (
                <span className={`absolute -top-2 -right-2 w-3 h-3 rounded-full border-2 border-white ${
                  localStorage.getItem("isAdmin") === "true" ? "bg-yellow-500" : "bg-green-500"
                }`}></span>
              )}
            </div>
            <span
              className="text-lg sm:text-lg leading-tight ml-3 mr-3 whitespace-nowrap"
              style={{ fontFamily: "Calibri, sans-serif" }}
            >
              {loggedIn ? (localStorage.getItem("isAdmin") === "true" ? "Admin Logado" : "Logado") : "Logar ou Cadastrar"}
            </span>
          </div>

          {profileOpen && (
            <ProfilePopup />
          )}

          <div className="flex-1 overflow-y-auto drawer-scroll">
            
            <div className="flex justify-between items-center flex-shrink-0 mb-4">
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
                Categorias
              </h2>
            </div>

            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className={`p-2 rounded text-black text-2xl md:text-3xl ${
                    cat === "Esportes" || cat === "Cinema" || cat === "Espiritualidade" || cat === "Rock & Metal" ? "bg-white" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                  <span className="cursor-pointer">{cat}</span>
                    {(cat === "Esportes" || cat === "Cinema" || cat === "Espiritualidade" || cat === "Rock & Metal") && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            expandAllRelated(cat);
                          }}
                          className="text-4xl text-black hover:text-yellow-400 mb-1.5 mr-4 transition-colors"
                          title="Expandir todos"
                        >
                          {/*<IoOpenOutline />*/}
                        </button>
                        <span 
                          className="text-4xl cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cat === "Esportes") toggleSportsExpanded();
                            else if (cat === "Cinema") toggleCinemaExpanded();
                            else if (cat === "Espiritualidade") toggleSpiritualityExpanded();
                            else if (cat === "Rock & Metal") toggleRockExpanded();
                          }}
                        >
                          {cat === "Esportes" 
                            ? (sportsExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : cat === "Cinema"
                            ? (cinemaExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : cat === "Espiritualidade"
                            ? (spiritualityExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : (rockExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {cat === "Esportes" && sportsExpanded && (
                    <ul className="mt-4 ml-1 space-y-2">
                      {sportsSubcategories.map((subcat, subIndex) => (
                        <li
                          key={subIndex}
                          className="p-1 rounded cursor-pointer text-black text-xl md:text-2xl hover:bg-gray-50"
                        >
                          {subcat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {cat === "Cinema" && cinemaExpanded && (
                    <ul className="mt-4 ml-1 space-y-2">
                      {cinemaSubcategories.map((subcat, subIndex) => (
                        <li
                          key={subIndex}
                          className="p-1 rounded cursor-pointer text-black text-xl md:text-2xl hover:bg-gray-50"
                        >
                          {subcat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {cat === "Espiritualidade" && spiritualityExpanded && (
                    <ul className="mt-4 ml-1 space-y-2">
                      {spiritualitySubcategories.map((subcat, subIndex) => (
                        <li
                          key={subIndex}
                          className="p-1 rounded cursor-pointer text-black text-xl md:text-2xl hover:bg-gray-50"
                        >
                          {subcat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {cat === "Rock & Metal" && rockExpanded && (
                    <div className="mt-3 ml-1 space-y-2">
                      <div className="flex justify-between items-center p-1">
                        <h4 className="text-black text-2xl md:text-3xl">
                          Subgêneros do Rock
                        </h4>
                        <div className="flex items-center space-x-1">
                          <span 
                            className="text-4xl md:text-3xl cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRockSubgenresExpanded();
                            }}
                          >
                            {rockSubgenresExpanded ? <CiSquareMinus /> : <CiSquarePlus />}
                          </span>
                        </div>
                      </div>
                      
                      {rockSubgenresExpanded && (
                        <div className="mt-1 ml-1 space-y-2">
                          {Object.entries(rockSubgenres).map(([category, subgenres], catIndex) => (
                            <div key={catIndex} className="space-y-1">
                              <div 
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleRockCategory(category)}
                              >
                                <h5 className="font-semibold text-black text-2xl md:text-xl">
                                  {category}
                                </h5>
                                <span className="text-3xl md:text-2xl">
                                  {expandedRockCategories[category] ? <CiSquareMinus /> : <CiSquarePlus />}
                                </span>
                              </div>
                              {expandedRockCategories[category] && (
                                <ul className="space-y-0.5 ml-1 mt-1">
                                  {subgenres.map((subgenre, subIndex) => (
                                    <li
                                      key={subIndex}
                                      className="p-0.5 rounded text-black text-2xl md:text-xl hover:bg-gray-50"
                                      style={{ fontFamily: "Calibri, sans-serif" }}
                                    >
                                      {subgenre}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <div className="flex justify-between items-center p-1">
                          <h4 className="text-black text-2xl md:text-3xl">
                            Subgêneros do Metal
                          </h4>
                          <div className="flex items-center space-x-1">
                            <span 
                              className="text-4xl md:text-3xl cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMetalExpanded();
                              }}
                            >
                              {metalExpanded ? <CiSquareMinus /> : <CiSquarePlus />}
                            </span>
                          </div>
                        </div>
                        
                        {metalExpanded && (
                          <div className="mt-1 ml-1 space-y-2">
                            {Object.entries(metalSubgenres).map(([category, subgenres], catIndex) => (
                              <div key={catIndex} className="space-y-1">
                                <div 
                                  className="flex justify-between items-center cursor-pointer"
                                  onClick={() => toggleMetalCategory(category)}
                                >
                                  <h5 className="font-semibold text-black text-2xl md:text-xl">
                                    {category}
                                  </h5>
                                  <span className="text-3xl md:text-2xl">
                                    {expandedMetalCategories[category] ? <CiSquareMinus /> : <CiSquarePlus />}
                                  </span>
                                </div>
                                {expandedMetalCategories[category] && (
                                  <ul className="space-y-0.5 ml-1 mt-1">
                                    {subgenres.map((subgenre, subIndex) => (
                                      <li
                                        key={subIndex}
                                        className="p-0.5 rounded text-black text-2xl md:text-xl hover:bg-gray-50"
                                        style={{ fontFamily: "Calibri, sans-serif" }}
                                      >
                                        {subgenre}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center flex-shrink-0 mb-4">
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap mt-6">
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

            <ul className="space-y-3 mb-6">
              {products.map((cat, index) => (
                <li
                  key={index}
                  className="p-2 rounded cursor-pointer text-black text-3xl md:text-3xl"
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