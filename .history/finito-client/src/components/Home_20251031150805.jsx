import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Pagamento from "./Pagamento";
import showImage from "../assets/bg.png";
import kt from "../assets/kurt.png";
import rnr from "../assets/rnr.png";
import rockBanner from "../assets/10.png";
import ch from "../assets/chad.png";
import jd from "../assets/jd.png";
import fclub from "../assets/fclub.png";
import bt from "../assets/bart.png";
import hotSymbol from "../assets/hot.png";
import ks from "../assets/krusty.png";
import coldSymbol from "../assets/cold.png";
import py from "../assets/python.gif";
import finitoBanner from "../assets/finito-banner.png";
import finitoAd from "../assets/finito-ad.png";
import logo from "../assets/logo.png";
import BannerTimer from "./BannerTimer";
import Products from "./Products";

// Updated bannerCombos array with separate banners for coupons and designs
const bannerCombos = [
  { bg: finitoBanner, overlay: null },
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true },
  { bg: bt, overlay: hotSymbol, symbolType: "hot" },
  { bg: ks, overlay: coldSymbol, symbolType: "cold" },
  { bg: fclub, overlay: null },
  { bg: py, overlay: null },
  { bg: "promo", overlay: null, promo: true }, // "Leve 4 Pague 3" banner
  { bg: "black", overlay: null, logo: true }, // Logo banner
  { bg: "cupons", overlay: null, cupons: true }, // NEW: "CUPONS DE DESCONTO" banner
  { bg: "designs", overlay: null, designs: true } // NEW: "MAIS DE 500 DESIGNS" banner
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const pagedItems = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );

  useEffect(() => {
    const bannerDuration = 18.15;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCombos.length);
    }, bannerDuration * 1000);

    return () => clearInterval(interval);
  }, [bannerCombos.length]);

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const phoneNumber = "5511999999999";
    const message = "Olá! Gostaria de mais informações sobre os produtos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Function to generate floating symbols
  const generateFloatingSymbols = (symbolType) => {
    const symbolSrc = symbolType === "hot" ? hotSymbol : coldSymbol;
    const symbols = [];
    const placed = [];
    const cols = 8;
    const rows = 5;
    const cellWidth = 1000 / cols;
    const cellHeight = 500 / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < 0.4) continue;
        const size = 20 + Math.random() * 20;
        const leftPx =
          col * cellWidth +
          cellWidth * 0.2 +
          Math.random() * (cellWidth * 0.6);
        const topPx =
          row * cellHeight +
          cellHeight * 0.2 +
          Math.random() * (cellHeight * 0.6);
        placed.push({ top: topPx, left: leftPx, size });
        symbols.push(
          <img
            key={`${row}-${col}`}
            src={symbolSrc}
            alt={symbolType === "hot" ? "Hot" : "Cold"}
            className="absolute opacity-65"
            style={{
              top: `${(topPx / 500) * 100}%`,
              left: `${(leftPx / 1000) * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) rotate(${
                Math.random() * 360
              }deg)`,
              zIndex: 1
            }}
          />
        );
      }
    }
    return symbols;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container with Safe Spacing */}
        <div className="flex justify-center items-center p-4 mt-4 sm:mt-6 md:mt-8">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[1400px] h-[350px] sm:h-[400px] md:h-[400px] lg:h-[525px]">
            
            {/* Banner Content */}
            {currentBanner === 3 ? ( // Krusty with cold symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute top-9 inset-0 w-full h-full object-contain z-10 p-2 transform scale-[1.125] sm:scale-[1.15] md:scale-[1.1] lg:scale-[1.1] origin-bottom transition-transform duration-300"
                />
              </div>
            ) : currentBanner === 2 ? ( // Bart with hot symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("hot")}
                <img
                  src={bt}
                  alt="Bart"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                />
              </div>
            ) : currentBanner === 6 ? ( // "Leve 4 Pague 3" Promo Banner
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-8">
                  {/* Main Promo Text */}
                  <div className="text-center mb-8">
                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-4 leading-tight">
                      LEVE 4
                    </h1>
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-yellow-300 mb-4 leading-tight">
                      PAGUE 3
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                      PROMOÇÃO ESPECIAL
                    </p>
                    <p className="text-xl sm:text-2xl text-white opacity-90">
                      Em todas as camisetas!
                    </p>
                  </div>
                </div>
              </div>
            ) : currentBanner === 7 ? ( // Logo banner
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <div className="relative flex justify-center items-center w-full h-full">
                  <img
                    src={logo}
                    alt="Finito Logo"
                    className="object-contain 
                      w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[65%]
                      h-auto max-h-[80%] sm:max-h-[85%] md:max-h-[90%]
                      transition-transform duration-500 ease-out
                      hover:scale-[1.02]"
                    style={{ 
                      objectFit: "contain",
                      objectPosition: "center center"
                    }}
                  />
                </div>
              </div>
            ) : currentBanner === 8 ? ( // NEW: "CUPONS DE DESCONTO" Banner
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-green-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-8">
                  {/* Main Title */}
                  <div className="text-center mb-8">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 leading-tight">
                      CUPONS DE
                    </h1>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-yellow-300 mb-6 leading-tight">
                      DESCONTO
                    </h2>
                  </div>
                  
                  {/* Promo Details */}
                  <div className="text-center mb-6">
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                      ATÉ 50% OFF
                    </p>
                    <p className="text-xl sm:text-2xl text-white opacity-90 font-semibold">
                      Em toda a loja!
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center">
                    <p className="text-lg sm:text-xl text-white opacity-90">
                      Use o código: <span className="font-bold text-yellow-300">FINITO50</span>
                    </p>
                  </div>

          
                </div>
              </div>
            ) : currentBanner === 9 ? ( // NEW: "MAIS DE 500 DESIGNS" Banner
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-8">
                  {/* Main Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                      MAIS DE
                    </h1>
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-orange-300 mb-6 leading-tight">
                      500 DESIGNS
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center mb-8">
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                      VARIEDADE E QUALIDADE
                    </p>
                    <p className="text-xl sm:text-2xl text-white opacity-90 font-semibold">
                      Para todos os gostos!
                    </p>
                  </div>

                       
                </div>
              </div>
            ) : currentBanner === 1 ? (
              // showImage BANNER
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />

                {/* MOBILE LAYOUT */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center pb-2 px-2">
                  <div className="relative mb-1 w-full flex justify-center">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="object-contain 
                        w-[75%]
                        max-h-[90px]
                        z-10"
                      style={{
                        transform: "scale(1.15) translateY(17px)"
                      }}
                    />
                  </div>
                  
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain 
                        w-[90%]
                        max-h-[240px]
                        sm:max-h-[250px]"
                      style={{
                        transform: "scale(1.1)"
                      }}
                    />
                  </div>
                </div>

                {/* DESKTOP LAYOUT */}
                <div className="hidden md:flex absolute bottom-0 left-1/2 transform -translate-x-1/2 items-end justify-between w-full px-8 md:px-12 lg:px-16 xl:px-20">
                  {/* KT - Left */}
                  <div className="flex justify-center items-end flex-1">
                    <div
                      className="relative scale-[0.9] lg:scale-[1.0] xl:scale-[1.4] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={kt}
                        alt="Kurt"
                        className="w-full h-auto object-contain max-h-[280px]"
                      />
                    </div>
                  </div>

                  {/* ch with rockBanner - Center */}
                  <div className="flex justify-center items-end flex-1 mx-4 md:mx-6">
                    <div
                      className="relative scale-[1.0] lg:scale-[1.1] xl:scale-[1.4] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={rockBanner}
                        alt="rockBanner"
                        className="absolute left-1/2 w-[60%] lg:w-[65%] h-auto z-10"
                        style={{
                          top: "-15%",
                          transform: "translateX(-50%)"
                        }}
                      />
                      <img
                        src={ch}
                        alt="Chad"
                        className="w-full h-auto object-contain max-h-[280px]"
                        style={{
                          transform: "translateY(18px)"
                        }}
                      />
                    </div>
                  </div>

                  {/* JD - Right */}
                  <div className="flex justify-center items-end flex-1">
                    <div
                      className="relative scale-[0.9] lg:scale-[1.0] xl:scale-[1.35] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={jd}
                        alt="JD"
                        className="w-full h-auto object-contain max-h-[280px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Other banners
              <div className="relative w-full h-full flex justify-center items-end p-0">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-3 sm:gap-6 md:gap-8">
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoBanner}
                        alt="Finito Banner"
                        className="object-contain 
                          w-[95%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[70%]
                          h-auto max-h-[95%] sm:max-h-[90%]"
                        style={{ 
                          objectFit: "contain",
                          transform: "scale(1.05) translateY(12px)",
                          objectPosition: "center center"
                        }}
                      />
                    </div>

                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoAd}
                        alt="Finito Ad"
                        className="object-contain 
                          w-[90%] sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%]
                          h-auto max-h-[95%] sm:max-h-[100%]"
                        style={{ 
                          objectFit: "contain",
                          objectPosition: "center center"
                        }}
                      />
                    </div>
                  </div>
                ) : bannerCombos[currentBanner].bg === fclub ? (
                  // FCLUB banner
                  <div className="flex justify-center items-end w-full h-full">
                    <img
                      src={fclub}
                      alt="F Club"
                      className="object-contain 
                        w-[95%]
                        sm:w-[90%] 
                        md:w-[85%] 
                        lg:w-[80%]
                        xl:w-[75%]
                        h-auto 
                        max-h-[100%]"
                      style={{ 
                        objectFit: "contain",
                        objectPosition: "center bottom",
                        width: "100%",
                        height: "auto"
                      }}
                    />
                  </div>
                ) : bannerCombos[currentBanner].bg === py ? (
                  // PYTHON banner
                  <div className="flex justify-center items-end w-full h-full relative">
                    <div className="relative w-full h-full flex justify-center items-end">
                      <img
                        src={py}
                        alt="Python"
                        className={`${
                          bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                        } object-contain 
                          w-[80%] sm:w-[85%] md:w-[90%] lg:w-[95%]
                          h-auto max-h-[90%] sm:max-h-[95%] lg:max-h-[95%]`}
                        style={{ 
                          objectFit: "contain",
                          objectPosition: "center bottom",
                          width: "100%",                        
                          height: "auto"
                        }}
                      />
                      
                      <div className="absolute inset-0 pointer-events-none">
                        <button
                          onClick={handleWhatsAppClick}
                          className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-105
                                     right-[15%] top-[6%]
                                     md:right-[30%] md:top-[6%]"
                          aria-label="Contact via WhatsApp"
                        >       
                          <FaWhatsapp className="text-green-500 size-12 sm:size-16 md:size-20 lg:size-22 xl:size-24" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Other single banners
                  <div className="flex justify-center items-center w-full h-full">
                    <img
                      src={bannerCombos[currentBanner].bg}
                      alt="Banner Background"
                      className={`${
                        bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                      } object-contain 
                        w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%]
                        h-auto max-h-[95%] sm:max-h-[90%]`}
                      style={{
                        objectFit: "contain",
                        objectPosition: "center center"
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-3 mt-6 mb-6">
          {bannerCombos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-4 h-4 rounded-full border-2 border-black transition-colors duration-300 ${
                idx === currentBanner ? "bg-red-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        <Products />

        {/* Pagination */}
        <div className="flex justify-center space-x-3 mt-6 mb-20">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded-full border-2 border-black transition-colors ${
                currentPage === idx + 1 ? "bg-red-500 text-white" : "bg-white"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
      {/*<Footer />*/}
    </div>
  );
}

export default App;