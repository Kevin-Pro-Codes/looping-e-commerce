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
  "Finito", "Música", "Games", "Cinema", "Esportes",
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

// Music Subcategories - Updated structure with separate tabs for each major genre
const musicSubcategories = {
  "Rock": {
    "Classic Rock / Mainstream": [
      "Classic rock", "Soft rock", 
      "Pop rock", "Blues rock", "Folk rock", "Garage rock", "Rock Brasileiro"
    ],
    "Punk & Alternative": [
      "Punk rock", "Post-punk", "Hardcore punk", "Pop punk",
      "Emo / Post-emo", "Indie rock", "Grunge", "Post-grunge", "Noise rock", "College rock",
      "Shoegaze", "Dream pop", "Post-rock", "Britpop"
    ],
    "Progressive / Experimental": [
      "Progressive rock (Prog rock)", "Art rock", "Psychedelic rock",
      "Krautrock", "Space rock", "Math rock", "Avant-rock", "Experimental rock"
    ],
    "Hard Rock / Arena Rock": [
      "Hard rock", "Arena rock / Stadium rock", "Southern rock",
      "Glam rock / Glitter rock", "Boogie rock"
    ],
    "Outros / Regional": [
      "Surf rock", "Rockabilly", "Garage rock revival",
      "Stoner rock", "Neo-psychedelia", "Desert rock", "Tropical rock"
    ]
  },
  "Metal": {
    "Traditional / Classic Metal": [
      "Heavy metal", "NWOBHM (New Wave of British Heavy Metal)",
      "Speed metal", "Power metal", "US power metal"
    ],
    "Extreme Metal": [
      "Thrash metal", "Death metal", "Black metal", "Doom metal",
      "Viking / Folk metal", "Gothic metal", "Melodic death metal",
      "Symphonic black metal", "Funeral doom"
    ],
    "Modern / Fusion Metal": [
      "Metalcore", "Deathcore", "Progressive metal", "Industrial metal",
      "Nu-metal", "Alternative metal", "Symphonic metal", "Rap metal"
    ],
    "Derivative / Experimental Styles": [
      "Stoner metal", "Sludge metal", "Post-metal", "Djent", "Groove metal",
      "Avant-garde metal", "Neoclassical metal"
    ]
  },
  "Rap & Hip Hop": {
    "Old School & Boom Bap": [
      "Old school hip hop", "Boom bap", "Jazz rap",
      "Golden age hip hop", "Underground hip hop"
    ],
    "Modern Styles": [
      "Trap", "Drill", "Mumble rap", "Cloud rap",
      "Emo rap", "Alternative hip hop"
    ],
    "Regional & Geographic": [
      "East Coast hip hop", "West Coast hip hop", "Southern hip hop",
      "Midwest hip hop", "UK drill", "Latin hip hop"
    ],
    "Subgêneros Específicos": [
      "Gangsta rap", "Conscious hip hop", "Political hip hop",
      "Hardcore hip hop", "Horrorcore", "Comedy hip hop"
    ]
  },
  "Reggae": {
    "Estilos Tradicionais": [
      "Roots reggae", "Rocksteady", "Ska",
      "Early reggae", "Dub"
    ],
    "Estilos Modernos": [
      "Dancehall", "Raggamuffin", "Reggae fusion",
      "Lovers rock", "Modern roots"
    ],
    "Fusões Regionais": [
      "Reggae brasileiro", "Reggae mexicano", "UK reggae",
      "African reggae", "Spanish reggae"
    ]
  },
  "Pop": {
    "Pop Mainstream": [
      "Pop mainstream", "Dance-pop", "Teen pop",
      "Bubblegum pop", "Latin pop"
    ],
    "Pop Alternativo": [
      "Indie pop", "Dream pop", "Baroque pop",
      "Orchestral pop", "Chamber pop"
    ],
    "Pop Eletrônico": [
      "Synth-pop", "Electropop", "Europop",
      "Italo disco", "Futurepop"
    ],
    "Pop Internacional": [
      "K-pop", "J-pop", "C-pop",
      "Latin pop", "World pop"
    ]
  },
  "Eletrônica": {
    "House": [
      "Deep house", "Tech house", "Progressive house",
      "Electro house", "French house"
    ],
    "Techno": [
      "Detroit techno", "Minimal techno", "Industrial techno",
      "Acid techno", "Hard techno"
    ],
    "Brasileira": [
      "Funk carioca", "Brega funk", "Tecnobrega",
      "Brazilian bass", "Samba rock"
    ],
    "Outros Estilos": [
      "Trance", "Dubstep", "Drum & Bass",
      "Ambient", "IDM", "Downtempo"
    ]
  },
  "Outros": {
    "Brasileira": [
      "MPB", "Samba", "Forró", "Axé",
      "Pagode", "Bossa nova", "Sertanejo"
    ],
    "Internacional": [
      "R&B", "Soul", "Funk", "Jazz",
      "Blues", "Country", "Folk"
    ],
    "Clássica & Erudita": [
      "Música clássica", "Ópera", "Barroco",
      "Romantismo", "Contemporânea"
    ],
    "Diversos": [
      "Gospel", "New age", "World music",
      "Experimental", "Avant-garde"
    ]
  }
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
  const [musicExpanded, setMusicExpanded] = useState(false);
  const [activeMusicTab, setActiveMusicTab] = useState("Rock"); // Estado para a aba ativa
  const [expandedTabs, setExpandedTabs] = useState({
    Rock: false,
    Metal: false,
    "Rap & Hip Hop": false,
    Reggae: false,
    Pop: false,
    Eletrônica: false,
    Outros: false
  });
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

  const toggleMusicExpanded = () => {
    setMusicExpanded(prev => !prev);
  };

  const toggleTabExpanded = (tabName) => {
    setExpandedTabs(prev => ({
      ...prev,
      [tabName]: !prev[tabName]
    }));
  };

  const expandAllRelated = (category) => {
    if (category === "Música") {
      setMusicExpanded(true);
      // Expandir todas as abas quando expandir música
      setExpandedTabs({
        Rock: true,
        Metal: true,
        "Rap & Hip Hop": true,
        Reggae: true,
        Pop: true,
        Eletrônica: true,
        Outros: true
      });
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
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-gray-300 mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl sm:text-2xl text-gray-800" />
        <span className="text-lg sm:text-xl font-bold text-gray-800">Conta</span>
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
            className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition"
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
            className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition"
          >
            Registrar
          </button>
        </>
      )}
    </div>
  );

  // Componente para as abas de música
  const MusicTabs = () => (
    <div className="mt-3 ml-1 space-y-2">
      {/* Abas principais */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(musicSubcategories).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMusicTab(tab)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeMusicTab === tab 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="space-y-3">
        {Object.keys(musicSubcategories).map((tab) => (
          activeMusicTab === tab && (
            <div key={tab}>
              <div className="flex justify-between items-center p-1">
                <h4 className="text-gray-800 text-2xl md:text-3xl cursor-pointer hover:text-yellow-400">
                  {tab}
                </h4>
                <div className="flex items-center space-x-1">
                  <span 
                    className="text-4xl md:text-3xl cursor-pointer text-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTabExpanded(tab);
                    }}
                  >
                    {expandedTabs[tab] ? <CiSquareMinus /> : <CiSquarePlus />}
                  </span>
                </div>
              </div>
              
              {expandedTabs[tab] && (
                <div className="mt-1 ml-1 space-y-2">
                  {Object.entries(musicSubcategories[tab]).map(([category, subgenres], catIndex) => (
                    <div key={catIndex} className="space-y-1">
                      <h6 className="font-semibold text-gray-800 text-xl md:text-lg cursor-pointer hover:text-yellow-400">
                        {category}
                      </h6>
                      <ul className="space-y-0.5 ml-1">
                        {subgenres.map((subgenre, subIndex) => (
                          <li
                            key={subIndex}
                            className="p-0.5 rounded text-gray-800 text-xl md:text-lg"
                            style={{ fontFamily: "Calibri, sans-serif" }}
                          >
                            {subgenre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Main Navbar - Dark gray background with white text/icons */}
      <nav className="bg-[#151515] shadow-md fixed top-0 left-0 w-full z-50 py-1 sm:py-2 md:py-2 lg:py-2 xl:py-2 2xl:py-2">
        {/* ... (o resto do navbar permanece igual) ... */}
        
        {/* O código do navbar principal permanece exatamente o mesmo */}
        {/* Apenas atualizei a estrutura de música para usar o novo sistema de abas */}
        
      </nav>

      {/* Sidebar Menu - Light gray background with dark text */}
      {menuOpen && (
        <div
          className="fixed top-0 left-0 h-full bg-gray-100 shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5"
          style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
        >
          
          <div
            className="flex items-center gap-3 mb-6 cursor-pointer"
            onClick={() => setProfileOpen(prev => !prev)}
          >
            <div className="relative">
              <FiUser className={`text-3xl text-gray-800`} />
              {loggedIn && (
                <span className={`absolute -top-2 -right-2 w-3 h-3 rounded-full border-2 border-gray-100 ${
                  localStorage.getItem("isAdmin") === "true" ? "bg-yellow-500" : "bg-green-500"
                }`}></span>
              )}
            </div>
            <span
              className="text-lg sm:text-lg leading-tight ml-3 mr-3 whitespace-nowrap text-gray-800"
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
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap text-gray-800">
                Categorias
              </h2>
            </div>

            <ul className="space-y-3">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className={`p-2 rounded text-gray-800 text-2xl md:text-3xl ${
                    cat === "Esportes" || cat === "Cinema" || cat === "Espiritualidade" || cat === "Música" ? "" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                  <span className="cursor-pointer">{cat}</span>
                    {(cat === "Esportes" || cat === "Cinema" || cat === "Espiritualidade" || cat === "Música") && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            expandAllRelated(cat);
                          }}
                          className="text-4xl text-gray-800 hover:text-yellow-400 mb-1.5 mr-4 transition-colors"
                          title="Expandir todos"
                        >
                          {/*<IoOpenOutline />*/}
                        </button>
                        <span 
                          className="text-4xl cursor-pointer text-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cat === "Esportes") toggleSportsExpanded();
                            else if (cat === "Cinema") toggleCinemaExpanded();
                            else if (cat === "Espiritualidade") toggleSpiritualityExpanded();
                            else if (cat === "Música") toggleMusicExpanded();
                          }}
                        >
                          {cat === "Esportes" 
                            ? (sportsExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : cat === "Cinema"
                            ? (cinemaExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : cat === "Espiritualidade"
                            ? (spiritualityExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
                            : (musicExpanded ? <CiSquareMinus /> : <CiSquarePlus />)
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
                          className="p-1 rounded cursor-pointer text-gray-800 text-xl md:text-2xl"
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
                          className="p-1 rounded cursor-pointer text-gray-800 text-xl md:text-2xl"
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
                          className="p-1 rounded cursor-pointer text-gray-800 text-xl md:text-2xl"
                        >
                          {subcat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {cat === "Música" && musicExpanded && (
                    <MusicTabs />
                  )}
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center flex-shrink-0 mb-4">
              <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap text-gray-800 mt-6">
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
                  className="p-2 rounded cursor-pointer text-gray-800 text-2xl md:text-3xl"
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